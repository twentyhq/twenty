import { DeleteRecordsCommand } from '@/command-menu-item/engine-command/record/components/DeleteRecordsCommand';
import { render } from '@testing-library/react';

let mockExecuteCommand: (() => void | Promise<unknown>) | undefined;

const mockRemoveSelectedRecordsFromRecordBoard = jest.fn();
const mockResetTableRowSelection = jest.fn();
const mockIncrementalDeleteManyRecords = jest.fn();
const mockRemoveNavigationMenuItemsByTargetRecordIds = jest.fn();
const mockCloseSidePanelMenu = jest.fn();

jest.mock(
  'twenty-shared/utils',
  () => ({
    isDefined: (value: unknown) => value !== null && value !== undefined,
  }),
  { virtual: true },
);

jest.mock(
  '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect',
  () => ({
    HeadlessEngineCommandWrapperEffect: ({
      execute,
    }: {
      execute: () => void | Promise<unknown>;
    }) => {
      mockExecuteCommand = execute;

      return null;
    },
  }),
);

jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
  () => ({
    useHeadlessCommandContextApi: () => ({
      recordIndexId: 'record-index-id',
      objectMetadataItem: {
        nameSingular: 'person',
      },
      selectedRecords: [{ id: 'record-id' }],
      graphqlFilter: { id: { in: ['record-id'] } },
    }),
  }),
);

jest.mock(
  '@/navigation-menu-item/common/hooks/useRemoveNavigationMenuItemByTargetRecordId',
  () => ({
    useRemoveNavigationMenuItemByTargetRecordId: () => ({
      removeNavigationMenuItemsByTargetRecordIds:
        mockRemoveNavigationMenuItemsByTargetRecordIds,
    }),
  }),
);

jest.mock(
  '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData',
  () => ({
    useNavigationMenuItemsData: () => ({
      navigationMenuItems: [],
      workspaceNavigationMenuItems: [],
    }),
  }),
);

jest.mock('@/object-record/hooks/useIncrementalDeleteManyRecords', () => ({
  useIncrementalDeleteManyRecords: () => ({
    incrementalDeleteManyRecords: mockIncrementalDeleteManyRecords,
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

describe('DeleteRecordsCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecuteCommand = undefined;
  });

  it('should close the side panel when deleting records', async () => {
    render(<DeleteRecordsCommand />);

    await mockExecuteCommand?.();

    expect(mockRemoveSelectedRecordsFromRecordBoard).toHaveBeenCalledTimes(1);
    expect(mockResetTableRowSelection).toHaveBeenCalledTimes(1);
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
    expect(mockIncrementalDeleteManyRecords).toHaveBeenCalledTimes(1);
    expect(mockCloseSidePanelMenu.mock.invocationCallOrder[0]).toBeLessThan(
      mockIncrementalDeleteManyRecords.mock.invocationCallOrder[0],
    );
    expect(
      mockRemoveNavigationMenuItemsByTargetRecordIds,
    ).not.toHaveBeenCalled();
  });
});
