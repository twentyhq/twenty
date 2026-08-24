import { SidePanelCreateRelatedRecordPage } from '@/side-panel/pages/create-related-record/components/SidePanelCreateRelatedRecordPage';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockExecuteTask = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
const mockIcon = () => null;
const mockTargetRecord = {
  id: 'record-id',
  targetObjectNameSingular: 'company',
};
let mockOnFileUploadComplete: (() => void) | undefined;
let mockReceivedTargetRecord: unknown;

jest.mock('@/activities/hooks/useRelatedRecordActions', () => ({
  useRelatedRecordActions: ({
    targetRecord,
    onFileUploadComplete: onFileUploadCompleteFromPage,
  }: {
    targetRecord: unknown;
    onFileUploadComplete: () => void;
  }) => {
    mockReceivedTargetRecord = targetRecord;
    mockOnFileUploadComplete = onFileUploadCompleteFromPage;

    return [
      {
        action: {
          id: 'create-task',
          label: 'Create task',
          Icon: mockIcon,
          isVisible: true,
          disabled: false,
          execute: mockExecuteTask,
        },
      },
      {
        action: {
          id: 'create-note',
          label: 'Create note',
          Icon: mockIcon,
          isVisible: false,
          disabled: false,
          execute: jest.fn(),
        },
      },
      {
        action: {
          id: 'attach-file',
          label: 'Attach file',
          Icon: mockIcon,
          isVisible: true,
          disabled: false,
          execute: jest.fn(),
        },
        supportElement: <span>File input</span>,
      },
      {
        action: {
          id: 'create-calendar-event',
          label: 'Create calendar event',
          Icon: mockIcon,
          isVisible: true,
          disabled: true,
          disabledReason: 'Add an email first',
          execute: jest.fn(),
        },
      },
    ];
  },
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockTargetRecord,
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));

jest.mock('@/side-panel/components/SidePanelList', () => ({
  SidePanelList: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/side-panel/components/SidePanelGroup', () => ({
  SidePanelGroup: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/command-menu/components/CommandMenuItem', () => ({
  CommandMenuItem: ({
    label,
    description,
    onClick,
    disabled,
  }: {
    label: string;
    description?: string;
    onClick?: () => void;
    disabled: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {label}
      {description}
    </button>
  ),
}));

describe('SidePanelCreateRelatedRecordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnFileUploadComplete = undefined;
    mockReceivedTargetRecord = undefined;
  });

  it('renders the visible bindings with their shared eligibility', async () => {
    const user = userEvent.setup();

    render(<SidePanelCreateRelatedRecordPage />);

    expect(mockReceivedTargetRecord).toBe(mockTargetRecord);

    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(mockExecuteTask).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Create note')).not.toBeInTheDocument();
    expect(screen.getByText('File input')).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: 'Create calendar eventAdd an email first',
      }),
    ).toBeDisabled();
  });

  it('closes the launcher after the shared file action completes', () => {
    render(<SidePanelCreateRelatedRecordPage />);

    mockOnFileUploadComplete?.();

    expect(mockCloseSidePanelMenu).toHaveBeenCalledTimes(1);
  });
});
