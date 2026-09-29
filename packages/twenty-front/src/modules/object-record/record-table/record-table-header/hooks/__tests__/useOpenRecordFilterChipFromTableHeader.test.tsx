import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';

import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useOpenRecordFilterChipFromTableHeader } from '@/object-record/record-table/record-table-header/hooks/useOpenRecordFilterChipFromTableHeader';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { TOGGLE_MINE_RECORD_FILTER_ID } from '@/views/constants/ToggleMineRecordFilterId';
import { buildToggleMineRecordFilter } from '@/views/utils/buildToggleMineRecordFilter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyAccountOwnerFieldMetadataItemMock =
  getMockObjectMetadataItemOrThrow('company').fields.find(
    (field) => field.name === 'accountOwner',
  );

if (!companyAccountOwnerFieldMetadataItemMock) {
  throw new Error('companyAccountOwnerFieldMetadataItemMock is not defined');
}

const mockSetEditableFilterChipDropdownStates = jest.fn();
const mockOpenDropdown = jest.fn();

jest.mock(
  '@/object-record/record-filter/hooks/useFilterableFieldMetadataItemsInRecordIndexContext',
  () => ({
    useFilterableFieldMetadataItemsInRecordIndexContext: () => ({
      filterableFieldMetadataItems: [companyAccountOwnerFieldMetadataItemMock],
    }),
  }),
);

jest.mock('@/views/hooks/useSetEditableFilterChipDropdownStates', () => ({
  useSetEditableFilterChipDropdownStates: () => ({
    setEditableFilterChipDropdownStates:
      mockSetEditableFilterChipDropdownStates,
  }),
}));

jest.mock('@/ui/layout/dropdown/hooks/useOpenDropdown', () => ({
  useOpenDropdown: () => ({ openDropdown: mockOpenDropdown }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <RecordFiltersComponentInstanceContext.Provider
      value={{ instanceId: 'test' }}
    >
      {children}
    </RecordFiltersComponentInstanceContext.Provider>
  </JotaiProvider>
);

describe('useOpenRecordFilterChipFromTableHeader', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
  });

  it('should not open the hidden All/Mine toggle filter', () => {
    const { result } = renderHook(
      () => {
        const { openRecordFilterChipFromTableHeader } =
          useOpenRecordFilterChipFromTableHeader();

        const currentRecordFilters = useAtomComponentStateValue(
          currentRecordFiltersComponentState,
        );

        const setCurrentRecordFilters = useSetAtomComponentState(
          currentRecordFiltersComponentState,
        );

        return {
          openRecordFilterChipFromTableHeader,
          currentRecordFilters,
          setCurrentRecordFilters,
        };
      },
      { wrapper },
    );

    act(() => {
      result.current.setCurrentRecordFilters([
        buildToggleMineRecordFilter(companyAccountOwnerFieldMetadataItemMock),
      ]);
    });

    act(() => {
      result.current.openRecordFilterChipFromTableHeader(
        companyAccountOwnerFieldMetadataItemMock.id,
      );
    });

    const newRecordFilter = result.current.currentRecordFilters.find(
      (recordFilter) => recordFilter.id !== TOGGLE_MINE_RECORD_FILTER_ID,
    );

    expect(result.current.currentRecordFilters).toHaveLength(2);
    expect(newRecordFilter?.fieldMetadataId).toBe(
      companyAccountOwnerFieldMetadataItemMock.id,
    );
    expect(mockSetEditableFilterChipDropdownStates).toHaveBeenCalledWith(
      newRecordFilter,
    );
  });
});
