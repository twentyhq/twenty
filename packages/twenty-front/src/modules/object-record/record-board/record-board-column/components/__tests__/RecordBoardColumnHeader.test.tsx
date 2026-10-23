import { RecordBoardColumnHeader } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeader';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { isRecordBoardCellsNonEditableComponentState } from '@/object-record/record-board/states/isRecordBoardCellsNonEditableComponentState';
import { isRecordBoardViewSettingsReadOnlyComponentState } from '@/object-record/record-board/states/isRecordBoardViewSettingsReadOnlyComponentState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { type ComponentState } from '@/ui/utilities/state/jotai/types/ComponentState';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockCreateNewIndexRecord = jest.fn();
const mockUseAtomComponentStateValue = jest.fn();
const mockObjectPermissions = jest.fn();
const mockHasSoftDeleteFilter = jest.fn();

jest.mock('@/object-record/record-board/contexts/RecordBoardContext', () => ({
  RecordBoardContext: jest.requireActual('react').createContext({
    objectMetadataItem: {
      id: 'opportunity',
      isUICreatable: true,
      isUIEditable: true,
      isRemote: false,
      writability: 'OPEN',
    },
    selectFieldMetadataItem: { name: 'stage' },
  }),
}));
jest.mock('@/object-record/hooks/useObjectPermissionsForObject', () => ({
  useObjectPermissionsForObject: () => mockObjectPermissions(),
}));
jest.mock('@/object-record/record-table/hooks/useCreateNewIndexRecord', () => ({
  useCreateNewIndexRecord: () => ({
    createNewIndexRecord: mockCreateNewIndexRecord,
  }),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (state: unknown) =>
      mockUseAtomComponentStateValue(state),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue',
  () => ({
    useAtomComponentFamilyStateValue: () => 0,
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({
    useAtomComponentSelectorValue: () => mockHasSoftDeleteFilter(),
  }),
);
jest.mock('@/ui/layout/dropdown/hooks/useOpenDropdown', () => ({
  useOpenDropdown: () => ({ openDropdown: jest.fn() }),
}));
jest.mock(
  '@/ui/utilities/drag-select/hooks/useDisableDragSelectOnPointerDown',
  () => ({
    useDisableDragSelectOnPointerDown: () => ({}),
  }),
);
jest.mock(
  '@/ui/utilities/drag-and-drop/components/DragDropItemSortableHandle',
  () => ({
    DragDropItemSortableHandle: ({ children }: { children: React.ReactNode }) =>
      children,
  }),
);
jest.mock(
  '@/object-record/record-table-widget/hooks/useIsRecordTableWidgetAggregateNonInteractive',
  () => ({
    useIsRecordTableWidgetAggregateNonInteractive: () => true,
  }),
);
jest.mock('@/object-record/record-group/components/RecordGroupChip', () => ({
  RecordGroupChip: () => <span>New</span>,
}));
jest.mock(
  '@/object-record/record-group/components/RecordGroupAggregateDropdown',
  () => ({
    RecordGroupAggregateDropdown: () => null,
  }),
);
jest.mock(
  '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu',
  () => ({
    RecordBoardColumnDropdownMenu: () => null,
  }),
);
jest.mock(
  '@/object-record/record-board/record-board-column/components/RecordBoardColumnResizeHandler',
  () => ({
    RecordBoardColumnResizeHandler: () => null,
  }),
);

const renderHeader = () =>
  render(
    <RecordBoardColumnContext.Provider
      value={{
        columnId: 'new',
        columnIndex: 0,
        recordIds: [],
        columnDefinition: {
          id: 'new',
          type: RecordGroupDefinitionType.Value,
          title: 'New',
          value: 'NEW',
          color: 'red',
          position: 0,
          isVisible: true,
        },
      }}
    >
      <RecordBoardColumnHeader />
    </RecordBoardColumnContext.Provider>,
  );

describe('RecordBoardColumnHeader creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObjectPermissions.mockReturnValue({ canUpdateObjectRecords: true });
    mockHasSoftDeleteFilter.mockReturnValue(false);
    mockUseAtomComponentStateValue.mockImplementation(
      (state: ComponentState<unknown>) =>
        state === isRecordBoardViewSettingsReadOnlyComponentState,
    );
  });

  it('creates in the selected group while widget view settings stay read-only', async () => {
    renderHeader();

    await userEvent.click(screen.getByRole('button', { name: 'Add new' }));

    expect(mockCreateNewIndexRecord).toHaveBeenCalledWith({
      position: 'first',
      stage: 'NEW',
    });
    expect(
      screen.queryByRole('button', { name: 'More options' }),
    ).not.toBeInTheDocument();
  });

  it('does not offer creation when the widget records are read-only', () => {
    mockUseAtomComponentStateValue.mockImplementation(
      (state: ComponentState<unknown>) =>
        state === isRecordBoardViewSettingsReadOnlyComponentState ||
        state === isRecordBoardCellsNonEditableComponentState,
    );
    renderHeader();

    expect(
      screen.queryByRole('button', { name: 'Add new' }),
    ).not.toBeInTheDocument();
  });

  it('keeps object creation permissions enforced', () => {
    mockObjectPermissions.mockReturnValue({ canUpdateObjectRecords: false });
    renderHeader();

    expect(
      screen.queryByRole('button', { name: 'Add new' }),
    ).not.toBeInTheDocument();
  });

  it('does not offer creation in the deleted-records view', () => {
    mockHasSoftDeleteFilter.mockReturnValue(true);
    renderHeader();

    expect(
      screen.queryByRole('button', { name: 'Add new' }),
    ).not.toBeInTheDocument();
  });
});
