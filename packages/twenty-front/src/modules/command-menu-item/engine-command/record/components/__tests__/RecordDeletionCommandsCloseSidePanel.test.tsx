import { DestroyRecordsCommand } from '@/command-menu-item/engine-command/record/components/DestroyRecordsCommand';
import { RestoreRecordsCommand } from '@/command-menu-item/engine-command/record/components/RestoreRecordsCommand';
import { render } from '@testing-library/react';

let mockConfirmationExecute: (() => void | Promise<unknown>) | undefined;

const mockRemoveSelectedRecordsFromRecordBoard = jest.fn();
const mockResetTableRowSelection = jest.fn();
const mockIncrementalDestroyManyRecords = jest.fn();
const mockFetchAllRecords = jest.fn();
const mockRestoreManyRecords = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
const mockNavigateApp = jest.fn();

const mockHeadlessCommandContextApi = jest.fn();

jest.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray, ...values: string[]) =>
    strings.reduce(
      (result, string, index) => `${result}${string}${values[index] ?? ''}`,
      '',
    ),
}));

jest.mock('@lingui/core', () => ({
  i18n: {
    _: (message: string | { message?: string }) =>
      typeof message === 'string' ? message : (message.message ?? ''),
  },
}));

jest.mock(
  'twenty-shared/types',
  () => ({
    AppPath: {
      RecordIndexPage: 'record-index-page',
    },
  }),
  { virtual: true },
);

jest.mock(
  'twenty-shared/utils',
  () => ({
    isDefined: (value: unknown) => value !== null && value !== undefined,
  }),
  { virtual: true },
);

jest.mock(
  '@/command-menu-item/engine-command/components/HeadlessConfirmationModalEngineCommandEffect',
  () => ({
    HeadlessConfirmationModalEngineCommandEffect: ({
      execute,
    }: {
      execute: () => void | Promise<unknown>;
    }) => {
      mockConfirmationExecute = execute;

      return null;
    },
  }),
);

jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
  () => ({
    useHeadlessCommandContextApi: () => mockHeadlessCommandContextApi(),
  }),
);

jest.mock('@/object-record/hooks/useIncrementalDestroyManyRecords', () => ({
  useIncrementalDestroyManyRecords: () => ({
    incrementalDestroyManyRecords: mockIncrementalDestroyManyRecords,
  }),
}));

jest.mock('@/object-record/hooks/useLazyFetchAllRecords', () => ({
  useLazyFetchAllRecords: () => ({
    fetchAllRecords: mockFetchAllRecords,
  }),
}));

jest.mock('@/object-record/hooks/useRestoreManyRecords', () => ({
  useRestoreManyRecords: () => ({
    restoreManyRecords: mockRestoreManyRecords,
  }),
}));

jest.mock(
  '@/object-record/record-board/hooks/useRemoveSelectedRecordsFromRecordBoard',
  () => ({
    useRemoveSelectedRecordsFromRecordBoard: () => ({
      removeSelectedRecordsFromRecordBoard:
        mockRemoveSelectedRecordsFromRecordBoard,
    }),
  }),
);

jest.mock(
  '@/object-record/record-table/hooks/internal/useResetTableRowSelection',
  () => ({
    useResetTableRowSelection: () => ({
      resetTableRowSelection: mockResetTableRowSelection,
    }),
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => mockNavigateApp,
}));

const buildContext = ({
  isInSidePanel = false,
  selectedRecordIds,
}: {
  isInSidePanel?: boolean;
  selectedRecordIds: string[];
}) => ({
  recordIndexId: 'record-index-id',
  objectMetadataItem: {
    labelPlural: 'People',
    labelSingular: 'Person',
    namePlural: 'people',
    nameSingular: 'person',
  },
  selectedRecords: selectedRecordIds.map((id) => ({ id })),
  graphqlFilter: { id: { in: selectedRecordIds } },
  isInSidePanel,
});

describe('record deletion commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirmationExecute = undefined;
    mockFetchAllRecords.mockResolvedValue([{ id: 'record-id' }]);
  });

  it('should close the side panel after restoring records', async () => {
    mockHeadlessCommandContextApi.mockReturnValue(
      buildContext({ selectedRecordIds: ['record-id'] }),
    );

    render(<RestoreRecordsCommand />);

    await mockConfirmationExecute?.();

    expect(mockRemoveSelectedRecordsFromRecordBoard).toHaveBeenCalledTimes(1);
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
    expect(mockRestoreManyRecords).toHaveBeenCalledWith({
      idsToRestore: ['record-id'],
    });
  });

  it('should close the side panel before permanently destroying multiple records', async () => {
    mockHeadlessCommandContextApi.mockReturnValue(
      buildContext({ selectedRecordIds: ['record-id-1', 'record-id-2'] }),
    );

    render(<DestroyRecordsCommand />);

    await mockConfirmationExecute?.();

    expect(mockIncrementalDestroyManyRecords).toHaveBeenCalledTimes(1);
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
    expect(mockCloseSidePanelMenu.mock.invocationCallOrder[0]).toBeLessThan(
      mockIncrementalDestroyManyRecords.mock.invocationCallOrder[0],
    );
    expect(mockNavigateApp).not.toHaveBeenCalled();
  });

  it('should close the side panel before permanently destroying a single side-panel record', async () => {
    mockHeadlessCommandContextApi.mockReturnValue(
      buildContext({
        isInSidePanel: true,
        selectedRecordIds: ['record-id'],
      }),
    );

    render(<DestroyRecordsCommand />);

    await mockConfirmationExecute?.();

    expect(mockIncrementalDestroyManyRecords).toHaveBeenCalledTimes(1);
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
    expect(mockCloseSidePanelMenu.mock.invocationCallOrder[0]).toBeLessThan(
      mockIncrementalDestroyManyRecords.mock.invocationCallOrder[0],
    );
    expect(mockNavigateApp).not.toHaveBeenCalled();
  });
});
