import { ObjectOptionsDropdownRecordGroupLoadLimitContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownRecordGroupLoadLimitContent';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockOnContentChange = jest.fn();
const mockHandleGroupLoadLimitChange = jest.fn();
const mockUseGroupLoadLimitValue = jest.fn();

jest.mock(
  '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown',
  () => ({
    useObjectOptionsDropdown: jest.fn(() => ({
      onContentChange: mockOnContentChange,
      dropdownId: 'object-options-dropdown',
    })),
  }),
);
jest.mock(
  '@/object-record/record-group/hooks/useRecordGroupVisibility',
  () => ({
    useRecordGroupVisibility: jest.fn(() => ({
      handleGroupLoadLimitChange: mockHandleGroupLoadLimitChange,
    })),
  }),
);
jest.mock('@/ui/layout/dropdown/components/DropdownContent', () => ({
  DropdownContent: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock(
  '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader',
  () => ({
    DropdownMenuHeader: ({ children }: { children: React.ReactNode }) =>
      children,
  }),
);
jest.mock(
  '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent',
  () => ({ DropdownMenuHeaderLeftComponent: () => null }),
);
jest.mock('@/ui/layout/dropdown/components/DropdownMenuItemsContainer', () => ({
  DropdownMenuItemsContainer: ({ children }: { children: React.ReactNode }) =>
    children,
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableList', () => ({
  SelectableList: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (state: unknown) => {
      const { recordIndexGroupLoadLimitComponentState } = jest.requireActual(
        '@/object-record/record-index/states/recordIndexGroupLoadLimitComponentState',
      );

      return state === recordIndexGroupLoadLimitComponentState
        ? mockUseGroupLoadLimitValue()
        : null;
    },
  }),
);
jest.mock('twenty-ui/primitives/navigation', () => ({
  ListItem: ({
    onClick,
    selected,
    children,
  }: {
    onClick?: () => void;
    selected: boolean;
    children: React.ReactNode;
  }) => (
    <button data-selected={selected} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('ObjectOptionsDropdownRecordGroupLoadLimitContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGroupLoadLimitValue.mockReturnValue(8);
  });

  it('offers every load limit option and checks the current one', () => {
    render(<ObjectOptionsDropdownRecordGroupLoadLimitContent />);

    expect(
      screen.getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['8', '25', '50', '100']);
    expect(screen.getByRole('button', { name: '8' })).toHaveAttribute(
      'data-selected',
      'true',
    );
    expect(screen.getByRole('button', { name: '25' })).toHaveAttribute(
      'data-selected',
      'false',
    );
  });

  it('checks the option matching the persisted view value', () => {
    mockUseGroupLoadLimitValue.mockReturnValue(50);

    render(<ObjectOptionsDropdownRecordGroupLoadLimitContent />);

    expect(screen.getByRole('button', { name: '50' })).toHaveAttribute(
      'data-selected',
      'true',
    );
  });

  it('persists the picked limit without leaving the submenu', async () => {
    const user = userEvent.setup();
    render(<ObjectOptionsDropdownRecordGroupLoadLimitContent />);

    await user.click(screen.getByRole('button', { name: '25' }));

    expect(mockHandleGroupLoadLimitChange).toHaveBeenCalledWith(25);
    expect(mockOnContentChange).not.toHaveBeenCalled();
  });
});
