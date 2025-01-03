import { renderHook } from '@testing-library/react';
import { createState } from '@ui/utilities/state/utils/createState';
import { ReactNode, act } from 'react';
import { RecoilRoot } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { textfieldDefinition } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordTableContextProvider } from '@/object-record/record-table/components/RecordTableContextProvider';
import { useUpsertTableRecordInGroup } from '@/object-record/record-table/hooks/internal/useUpsertTableRecordInGroup';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const draftValue = 'updated Name';
const recordGroupId = 'recordGroupId';

// Todo refactor this test to inject the states in a cleaner way instead of mocking hooks
// (this is not easy to maintain while refactoring)
jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  __esModule: true,
  useCreateOneRecord: jest.fn(),
}));

const draftValueState = createState<string | null>({
  key: 'draftValueState',
  defaultValue: null,
});
jest.mock(
  '@/object-record/record-field/hooks/internal/useRecordFieldInputStates',
  () => ({
    __esModule: true,
    useRecordFieldInputStates: jest.fn(() => ({
      getDraftValueSelector: () => draftValueState,
    })),
  }),
);

const recordTablePendingRecordIdByGroupComponentFamilyState = createFamilyState<
  string | null,
  string
>({
  key: 'recordTablePendingRecordIdByGroupComponentFamilyState',
  defaultValue: null,
});

const createOneRecordMock = jest.fn();
const updateOneRecordMock = jest.fn();
(useCreateOneRecord as jest.Mock).mockReturnValue({
  createOneRecord: createOneRecordMock,
});

const Wrapper = ({
  children,
  pendingRecordIdMockedValue,
  draftValueMockedValue,
}: {
  children: ReactNode;
  pendingRecordIdMockedValue: string | null;
  draftValueMockedValue: string | null;
}) => (
  <RecoilRoot
    initializeState={(snapshot) => {
      snapshot.set(objectMetadataItemsState, generatedMockObjectMetadataItems);
      snapshot.set(
        recordTablePendingRecordIdByGroupComponentFamilyState(recordGroupId),
        pendingRecordIdMockedValue,
      );
      snapshot.set(draftValueState, draftValueMockedValue);
    }}
  >
    <RecordTableContextProvider
      recordTableId="recordTableId"
      objectNameSingular={CoreObjectNameSingular.Person}
      viewBarId="viewBarId"
    >
      <RecordTableComponentInstanceContext.Provider
        value={{
          instanceId: CoreObjectNamePlural.Person,
          onColumnsChange: jest.fn(),
        }}
      >
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: CoreObjectNamePlural.Person }}
        >
          <FieldContext.Provider
            value={{
              recordId: 'recordId',
              fieldDefinition: {
                ...textfieldDefinition,
                metadata: {
                  ...textfieldDefinition.metadata,
                  objectMetadataNameSingular: CoreObjectNameSingular.Person,
                },
              },
              hotkeyScope: TableHotkeyScope.Table,
              isLabelIdentifier: false,
            }}
          >
            {children}
          </FieldContext.Provider>
        </ViewComponentInstanceContext.Provider>
      </RecordTableComponentInstanceContext.Provider>
    </RecordTableContextProvider>
  </RecoilRoot>
);

describe('useUpsertTableRecordInGroup', () => {
  beforeEach(async () => {
    createOneRecordMock.mockClear();
    updateOneRecordMock.mockClear();
  });

  it('calls update record if there is no pending record', async () => {
    /**
     * {
          objectNameSingular: 'person',
          recordTableId: 'recordTableId',
        }
     */
    const { result } = renderHook(
      () => useUpsertTableRecordInGroup(recordGroupId),
      {
        wrapper: ({ children }) =>
          Wrapper({
            pendingRecordIdMockedValue: null,
            draftValueMockedValue: null,
            children,
          }),
      },
    );

    await act(async () => {
      await result.current.upsertTableRecordInGroup(
        updateOneRecordMock,
        'recordId',
        'name',
      );
    });

    expect(createOneRecordMock).not.toHaveBeenCalled();
    expect(updateOneRecordMock).toHaveBeenCalled();
  });

  it('calls update record if pending record is empty', async () => {
    const { result } = renderHook(
      () => useUpsertTableRecordInGroup(recordGroupId),
      {
        wrapper: ({ children }) =>
          Wrapper({
            pendingRecordIdMockedValue: null,
            draftValueMockedValue: draftValue,
            children,
          }),
      },
    );

    await act(async () => {
      await result.current.upsertTableRecordInGroup(
        updateOneRecordMock,
        'recordId',
        'name',
      );
    });

    expect(createOneRecordMock).not.toHaveBeenCalled();
    expect(updateOneRecordMock).toHaveBeenCalled();
  });
});
