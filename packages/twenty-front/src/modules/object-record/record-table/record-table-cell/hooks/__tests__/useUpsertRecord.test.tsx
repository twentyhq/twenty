import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';
import { createState } from 'twenty-ui';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { textfieldDefinition } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useUpsertRecord } from '@/object-record/record-table/record-table-cell/hooks/useUpsertRecord';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const draftValue = 'updated Name';

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

const pendingRecordIdState = createState<string | null>({
  key: 'pendingRecordIdState',
  defaultValue: null,
});
jest.mock(
  '@/object-record/record-table/hooks/internal/useRecordTableStates',
  () => ({
    __esModule: true,
    useRecordTableStates: jest.fn(() => ({
      pendingRecordIdState: pendingRecordIdState,
    })),
  }),
);

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
      snapshot.set(pendingRecordIdState, pendingRecordIdMockedValue);
      snapshot.set(draftValueState, draftValueMockedValue);
    }}
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
  </RecoilRoot>
);

describe('useUpsertRecord', () => {
  beforeEach(async () => {
    createOneRecordMock.mockClear();
    updateOneRecordMock.mockClear();
  });

  it('calls update record if there is no pending record', async () => {
    const { result } = renderHook(
      () => useUpsertRecord({ objectNameSingular: 'person' }),
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
      await result.current.upsertRecord(
        updateOneRecordMock,
        'recordId',
        'name',
        'recordTableId',
      );
    });

    expect(createOneRecordMock).not.toHaveBeenCalled();
    expect(updateOneRecordMock).toHaveBeenCalled();
  });

  it('calls update record if pending record is empty', async () => {
    const { result } = renderHook(
      () => useUpsertRecord({ objectNameSingular: 'person' }),
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
      await result.current.upsertRecord(
        updateOneRecordMock,
        'recordId',
        'name',
        'recordTableId',
      );
    });

    expect(createOneRecordMock).not.toHaveBeenCalled();
    expect(updateOneRecordMock).toHaveBeenCalled();
  });
});
