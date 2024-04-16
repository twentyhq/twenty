import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { createState } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { textfieldDefinition } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useUpsertRecord } from '@/object-record/record-table/record-table-cell/hooks/useUpsertRecord';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';

const pendingRecordId = 'a7286b9a-c039-4a89-9567-2dfa7953cda9';
const draftValue = 'updated Name';

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
      snapshot.set(pendingRecordIdState, pendingRecordIdMockedValue);
      snapshot.set(draftValueState, draftValueMockedValue);
    }}
  >
    <FieldContext.Provider
      value={{
        entityId: 'entityId',
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
    const { result } = renderHook(() => useUpsertRecord(), {
      wrapper: ({ children }) =>
        Wrapper({
          pendingRecordIdMockedValue: null,
          draftValueMockedValue: null,
          children,
        }),
    });

    await act(async () => {
      await result.current.upsertRecord(updateOneRecordMock);
    });

    expect(createOneRecordMock).not.toHaveBeenCalled();
    expect(updateOneRecordMock).toHaveBeenCalled();
  });

  it('calls update record if pending record is empty', async () => {
    const { result } = renderHook(() => useUpsertRecord(), {
      wrapper: ({ children }) =>
        Wrapper({
          pendingRecordIdMockedValue: null,
          draftValueMockedValue: draftValue,
          children,
        }),
    });

    await act(async () => {
      await result.current.upsertRecord(updateOneRecordMock);
    });

    expect(createOneRecordMock).not.toHaveBeenCalled();
    expect(updateOneRecordMock).toHaveBeenCalled();
  });

  it('calls create record if pending record is not empty', async () => {
    const { result } = renderHook(() => useUpsertRecord(), {
      wrapper: ({ children }) =>
        Wrapper({
          pendingRecordIdMockedValue: pendingRecordId,
          draftValueMockedValue: draftValue,
          children,
        }),
    });

    await act(async () => {
      await result.current.upsertRecord(updateOneRecordMock);
    });

    expect(createOneRecordMock).toHaveBeenCalledWith({
      id: pendingRecordId,
      name: draftValue,
      position: 'first',
    });
    expect(updateOneRecordMock).not.toHaveBeenCalled();
  });
});
