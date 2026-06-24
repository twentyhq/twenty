import { CreateNewIndexRecordNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateNewIndexRecordNoSelectionRecordCommand';
import { CreateNewViewNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateNewViewNoSelectionRecordCommand';
import { HideDeletedRecordsNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/HideDeletedRecordsNoSelectionRecordCommand';
import { ImportRecordsNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/ImportRecordsNoSelectionRecordCommand';
import { SeeDeletedRecordsNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/SeeDeletedRecordsNoSelectionRecordCommand';
import { render } from '@testing-library/react';

let mockExecuteCommand: (() => void | Promise<unknown>) | undefined;

const mockCloseSidePanelMenu = jest.fn();
const mockCreateNewIndexRecord = jest.fn();
const mockOpenDropdown = jest.fn();
const mockSetViewPickerReferenceViewId = jest.fn();
const mockSetViewPickerMode = jest.fn();
const mockRemoveRecordFilter = jest.fn();
const mockHandleToggleTrashColumnFilter = jest.fn();
const mockToggleSoftDeleteFilterState = jest.fn();
const mockOpenObjectRecordsSpreadsheetImportDialog = jest.fn();

const mockHeadlessCommandContextApi = jest.fn();
const deletedRecordFilter = { id: 'deleted-filter-id', isDeletedFilter: true };

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
    useHeadlessCommandContextApi: () => mockHeadlessCommandContextApi(),
  }),
);

jest.mock(
  '@/object-record/record-filter/hooks/useCheckIsSoftDeleteFilter',
  () => ({
    useCheckIsSoftDeleteFilter: () => ({
      isRecordFilterAboutSoftDelete: (recordFilter: {
        isDeletedFilter?: boolean;
      }) => recordFilter.isDeletedFilter === true,
    }),
  }),
);

jest.mock('@/object-record/record-filter/hooks/useRemoveRecordFilter', () => ({
  useRemoveRecordFilter: () => ({
    removeRecordFilter: mockRemoveRecordFilter,
  }),
}));

jest.mock(
  '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter',
  () => ({
    useHandleToggleTrashColumnFilter: () => ({
      handleToggleTrashColumnFilter: mockHandleToggleTrashColumnFilter,
      toggleSoftDeleteFilterState: mockToggleSoftDeleteFilterState,
    }),
  }),
);

jest.mock('@/object-record/record-table/hooks/useCreateNewIndexRecord', () => ({
  useCreateNewIndexRecord: () => ({
    createNewIndexRecord: mockCreateNewIndexRecord,
  }),
}));

jest.mock(
  '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog',
  () => ({
    useOpenObjectRecordsSpreadsheetImportDialog: () => ({
      openObjectRecordsSpreadsheetImportDialog:
        mockOpenObjectRecordsSpreadsheetImportDialog,
    }),
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));

jest.mock('@/ui/layout/dropdown/hooks/useOpenDropdown', () => ({
  useOpenDropdown: () => ({
    openDropdown: mockOpenDropdown,
  }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => [deletedRecordFilter],
  }),
);

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => mockSetViewPickerReferenceViewId,
}));

jest.mock('@/views/view-picker/hooks/useViewPickerMode', () => ({
  useViewPickerMode: () => ({
    setViewPickerMode: mockSetViewPickerMode,
  }),
}));

const baseContext = {
  currentViewId: 'view-id',
  recordIndexId: 'record-index-id',
  objectMetadataItem: {
    nameSingular: 'person',
  },
};

describe('no-selection record commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecuteCommand = undefined;
    mockHeadlessCommandContextApi.mockReturnValue(baseContext);
  });

  it('should keep the side panel open when creating a new index record', async () => {
    render(<CreateNewIndexRecordNoSelectionRecordCommand />);

    await mockExecuteCommand?.();

    expect(mockCreateNewIndexRecord).toHaveBeenCalledWith({
      position: 'first',
    });
    expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  });

  it('should close the side panel before opening the create view dropdown', async () => {
    render(<CreateNewViewNoSelectionRecordCommand />);

    await mockExecuteCommand?.();

    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
    expect(mockSetViewPickerReferenceViewId).toHaveBeenCalledWith('view-id');
    expect(mockSetViewPickerMode).toHaveBeenCalledWith('create-empty');
    expect(mockOpenDropdown).toHaveBeenCalledTimes(1);
    expect(mockCloseSidePanelMenu.mock.invocationCallOrder[0]).toBeLessThan(
      mockOpenDropdown.mock.invocationCallOrder[0],
    );
  });

  it('should close the side panel after hiding deleted records', async () => {
    render(<HideDeletedRecordsNoSelectionRecordCommand />);

    await mockExecuteCommand?.();

    expect(mockRemoveRecordFilter).toHaveBeenCalledWith({
      recordFilterId: 'deleted-filter-id',
    });
    expect(mockToggleSoftDeleteFilterState).toHaveBeenCalledWith(false);
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
  });

  it('should close the side panel after opening the import records dialog', async () => {
    render(<ImportRecordsNoSelectionRecordCommand />);

    await mockExecuteCommand?.();

    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
    expect(mockOpenObjectRecordsSpreadsheetImportDialog).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should close the side panel after showing deleted records', async () => {
    render(<SeeDeletedRecordsNoSelectionRecordCommand />);

    await mockExecuteCommand?.();

    expect(mockHandleToggleTrashColumnFilter).toHaveBeenCalledTimes(1);
    expect(mockToggleSoftDeleteFilterState).toHaveBeenCalledWith(true);
    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
  });
});
