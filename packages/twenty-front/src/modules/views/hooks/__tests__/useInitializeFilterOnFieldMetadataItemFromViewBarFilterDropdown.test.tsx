import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown } from '@/views/hooks/useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { getFilterTypeFromFieldType } from 'twenty-shared/utils';
import { getMockPersonObjectMetadataItem } from '~/testing/mock-data/people';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const mockPushFocusItemToFocusStack = jest.fn();

jest.mock('@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack', () => ({
  usePushFocusItemToFocusStack: () => ({
    pushFocusItemToFocusStack: mockPushFocusItemToFocusStack,
  }),
}));

const peopleObjectMetadataItemMock = getMockPersonObjectMetadataItem();
const personCityFieldMetadataItemMock =
  peopleObjectMetadataItemMock.fields.find((field) => field.name === 'city');
const personCompanyFieldMetadataItemMock =
  peopleObjectMetadataItemMock.fields.find((field) => field.name === 'company');
const personCreatedAtFieldMetadataItemMock =
  peopleObjectMetadataItemMock.fields.find(
    (field) => field.name === 'createdAt',
  );

const wrapper = ({ children }: { children: React.ReactNode }) => {
  jotaiStore.set(
    objectMetadataItemsState.atom,
    generatedMockObjectMetadataItems,
  );
  return (
    <JotaiProvider store={jotaiStore}>
      <ObjectFilterDropdownComponentInstanceContext.Provider
        value={{ instanceId: 'test' }}
      >
        <RecordFiltersComponentInstanceContext.Provider
          value={{ instanceId: 'test' }}
        >
          {children}
        </RecordFiltersComponentInstanceContext.Provider>
      </ObjectFilterDropdownComponentInstanceContext.Provider>
    </JotaiProvider>
  );
};

describe('useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown', () => {
  beforeEach(() => {
    resetJotaiStore();
    jest.clearAllMocks();
  });

  it('should initialize filter for a basic text field with no existing filter', () => {
    const { result } = renderHook(
      () => {
        const { initializeFilterOnFieldMetataItemFromViewBarFilterDropdown } =
          useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown();

        const fieldMetadataItemUsedInDropdown = useAtomComponentSelectorValue(
          fieldMetadataItemUsedInDropdownComponentSelector,
        );
        const objectFilterDropdownFilterIsSelected = useAtomComponentStateValue(
          objectFilterDropdownFilterIsSelectedComponentState,
        );
        const selectedOperandInDropdown = useAtomComponentStateValue(
          selectedOperandInDropdownComponentState,
        );

        return {
          initializeFilterOnFieldMetataItemFromViewBarFilterDropdown,
          fieldMetadataItemUsedInDropdown,
          objectFilterDropdownFilterIsSelected,
          selectedOperandInDropdown,
        };
      },
      {
        wrapper,
      },
    );

    if (!personCityFieldMetadataItemMock) {
      throw new Error('personCityFieldMetadataItemMock is not defined');
    }

    const defaultOperand = getRecordFilterOperands({
      filterType: getFilterTypeFromFieldType(
        personCityFieldMetadataItemMock.type,
      ),
    })?.[0];

    act(() => {
      result.current.initializeFilterOnFieldMetataItemFromViewBarFilterDropdown(
        personCityFieldMetadataItemMock,
      );
    });

    expect(result.current.fieldMetadataItemUsedInDropdown?.id).toBe(
      personCityFieldMetadataItemMock.id,
    );
    expect(result.current.objectFilterDropdownFilterIsSelected).toBe(true);
    expect(result.current.selectedOperandInDropdown).toBe(defaultOperand);
    expect(mockPushFocusItemToFocusStack).not.toHaveBeenCalled();
  });

  it('should initialize filter with a relation field', () => {
    const { result } = renderHook(
      () => {
        const { initializeFilterOnFieldMetataItemFromViewBarFilterDropdown } =
          useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown();

        const fieldMetadataItemUsedInDropdown = useAtomComponentSelectorValue(
          fieldMetadataItemUsedInDropdownComponentSelector,
        );
        const objectFilterDropdownFilterIsSelected = useAtomComponentStateValue(
          objectFilterDropdownFilterIsSelectedComponentState,
        );
        const selectedOperandInDropdown = useAtomComponentStateValue(
          selectedOperandInDropdownComponentState,
        );

        return {
          initializeFilterOnFieldMetataItemFromViewBarFilterDropdown,
          fieldMetadataItemUsedInDropdown,
          objectFilterDropdownFilterIsSelected,
          selectedOperandInDropdown,
        };
      },
      {
        wrapper,
      },
    );

    if (!personCompanyFieldMetadataItemMock) {
      throw new Error('personCompanyFieldMetadataItemMock is not defined');
    }

    const defaultOperand = getRecordFilterOperands({
      filterType: getFilterTypeFromFieldType(
        personCompanyFieldMetadataItemMock.type,
      ),
    })?.[0];

    act(() => {
      result.current.initializeFilterOnFieldMetataItemFromViewBarFilterDropdown(
        personCompanyFieldMetadataItemMock,
      );
    });

    expect(result.current.fieldMetadataItemUsedInDropdown?.id).toBe(
      personCompanyFieldMetadataItemMock.id,
    );
    expect(result.current.objectFilterDropdownFilterIsSelected).toBe(true);
    expect(result.current.selectedOperandInDropdown).toBe(defaultOperand);
    expect(mockPushFocusItemToFocusStack).toHaveBeenCalledWith({
      focusId: ViewBarFilterDropdownIds.MAIN,
      component: {
        type: FocusComponentType.DROPDOWN,
        instanceId: personCompanyFieldMetadataItemMock.id,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  });

  it('should initialize filter with a duplicate field on city', () => {
    const { result } = renderHook(
      () => {
        const { initializeFilterOnFieldMetataItemFromViewBarFilterDropdown } =
          useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown();

        const fieldMetadataItemUsedInDropdown = useAtomComponentSelectorValue(
          fieldMetadataItemUsedInDropdownComponentSelector,
        );
        const objectFilterDropdownFilterIsSelected = useAtomComponentStateValue(
          objectFilterDropdownFilterIsSelectedComponentState,
        );
        const selectedOperandInDropdown = useAtomComponentStateValue(
          selectedOperandInDropdownComponentState,
        );

        const objectFilterDropdownCurrentRecordFilter =
          useAtomComponentStateValue(
            objectFilterDropdownCurrentRecordFilterComponentState,
          );

        const setCurrentRecordFilters = useSetAtomComponentState(
          currentRecordFiltersComponentState,
          'test',
        );

        const currentRecordFilters = useAtomComponentStateValue(
          currentRecordFiltersComponentState,
          'test',
        );

        return {
          initializeFilterOnFieldMetataItemFromViewBarFilterDropdown,
          fieldMetadataItemUsedInDropdown,
          objectFilterDropdownFilterIsSelected,
          selectedOperandInDropdown,
          setCurrentRecordFilters,
          currentRecordFilters,
          objectFilterDropdownCurrentRecordFilter,
        };
      },
      {
        wrapper,
      },
    );

    if (!personCityFieldMetadataItemMock) {
      throw new Error('personCityFieldMetadataItemMock is not defined');
    }

    const defaultOperand = getRecordFilterOperands({
      filterType: getFilterTypeFromFieldType(
        personCityFieldMetadataItemMock.type,
      ),
    })?.[0];

    const mockExistingFilterOnCity: RecordFilter = {
      id: 'existing-filter-id',
      fieldMetadataId: personCityFieldMetadataItemMock.id,
      operand: defaultOperand,
      displayValue: 'Test City',
      label: personCityFieldMetadataItemMock.label,
      type: getFilterTypeFromFieldType(personCityFieldMetadataItemMock.type),
      value: '',
    };

    act(() => {
      result.current.setCurrentRecordFilters([mockExistingFilterOnCity]);
    });

    expect(result.current.currentRecordFilters.length).toBe(1);

    act(() => {
      result.current.initializeFilterOnFieldMetataItemFromViewBarFilterDropdown(
        personCityFieldMetadataItemMock,
      );
    });

    expect(result.current.objectFilterDropdownCurrentRecordFilter).toBe(
      mockExistingFilterOnCity,
    );
  });

  it('should initialize filter on a date field correctly', () => {
    const { result } = renderHook(
      () => {
        const { initializeFilterOnFieldMetataItemFromViewBarFilterDropdown } =
          useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown();

        const fieldMetadataItemUsedInDropdown = useAtomComponentSelectorValue(
          fieldMetadataItemUsedInDropdownComponentSelector,
        );
        const objectFilterDropdownFilterIsSelected = useAtomComponentStateValue(
          objectFilterDropdownFilterIsSelectedComponentState,
        );
        const selectedOperandInDropdown = useAtomComponentStateValue(
          selectedOperandInDropdownComponentState,
        );

        const objectFilterDropdownCurrentRecordFilter =
          useAtomComponentStateValue(
            objectFilterDropdownCurrentRecordFilterComponentState,
          );

        const setCurrentRecordFilters = useSetAtomComponentState(
          currentRecordFiltersComponentState,
          'test',
        );

        const currentRecordFilters = useAtomComponentStateValue(
          currentRecordFiltersComponentState,
          'test',
        );

        return {
          initializeFilterOnFieldMetataItemFromViewBarFilterDropdown,
          fieldMetadataItemUsedInDropdown,
          objectFilterDropdownFilterIsSelected,
          selectedOperandInDropdown,
          setCurrentRecordFilters,
          currentRecordFilters,
          objectFilterDropdownCurrentRecordFilter,
        };
      },
      {
        wrapper,
      },
    );

    if (!personCreatedAtFieldMetadataItemMock) {
      throw new Error('personCreatedAtFieldMetadataItemMock is not defined');
    }

    expect(result.current.currentRecordFilters.length).toBe(0);

    act(() => {
      result.current.initializeFilterOnFieldMetataItemFromViewBarFilterDropdown(
        personCreatedAtFieldMetadataItemMock,
      );
    });

    expect(result.current.fieldMetadataItemUsedInDropdown?.id).toBe(
      personCreatedAtFieldMetadataItemMock.id,
    );

    expect(
      result.current.objectFilterDropdownCurrentRecordFilter?.fieldMetadataId,
    ).toBe(personCreatedAtFieldMetadataItemMock.id);

    expect(
      result.current.objectFilterDropdownCurrentRecordFilter?.value,
    ).toBeDefined();
  });
});
