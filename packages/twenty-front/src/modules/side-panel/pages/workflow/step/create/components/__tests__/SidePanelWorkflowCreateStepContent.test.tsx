import { SidePanelWorkflowCreateStepContent } from '@/side-panel/pages/workflow/step/create/components/SidePanelWorkflowCreateStepContent';
import { type WorkflowActionSelection } from '@/side-panel/pages/workflow/action/components/SidePanelWorkflowSelectAction';
import { type StartNodeCreationParams } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockCreateStep = jest.fn();
const mockUpdateStep = jest.fn();
const mockOpenWorkflowEditStep = jest.fn();
const mockSetInsertStepIds = jest.fn();
let mockInsertStepIds: StartNodeCreationParams;
const mockParentStep = {
  id: 'if-else',
  type: 'IF_ELSE',
  name: 'If/Else',
  settings: {
    input: {
      stepFilterGroups: [],
      stepFilters: [],
      branches: [
        {
          id: 'if',
          filterGroupId: 'filter',
          nextStepIds: ['configured-action'],
        },
        { id: 'else', nextStepIds: ['other-action'] },
      ],
    },
  },
};

jest.mock(
  '@/side-panel/pages/workflow/action/components/SidePanelWorkflowSelectAction',
  () => ({
    SidePanelWorkflowSelectAction: ({
      onActionSelected,
    }: {
      onActionSelected: (selection: WorkflowActionSelection) => void;
    }) => (
      <button onClick={() => onActionSelected({ type: 'FIND_RECORDS' })}>
        Search Records
      </button>
    ),
  }),
);
jest.mock('@/workflow/states/flowComponentState', () => ({
  flowComponentState: 'flow',
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (state: string) =>
      state === 'flow' ? { steps: [mockParentStep] } : 'workflow-id',
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentState', () => ({
  useAtomComponentState: () => [mockInsertStepIds, mockSetInsertStepIds],
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: () => jest.fn(),
}));
jest.mock('@/workflow/workflow-steps/hooks/useCreateStep', () => ({
  useCreateStep: () => ({ createStep: mockCreateStep }),
}));
jest.mock('@/workflow/workflow-steps/hooks/useUpdateStep', () => ({
  useUpdateStep: () => ({ updateStep: mockUpdateStep }),
}));
jest.mock('@/workflow/workflow-diagram/hooks/useCloseRightClickMenu', () => ({
  useCloseRightClickMenu: () => ({ closeRightClickMenu: jest.fn() }),
}));
jest.mock(
  '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowNavigation',
  () => ({
    useSidePanelWorkflowNavigation: () => ({
      openWorkflowEditStepInSidePanel: mockOpenWorkflowEditStep,
    }),
  }),
);

describe('SidePanelWorkflowCreateStepContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateStep.mockResolvedValue({
      id: 'inserted',
      name: 'Search Records',
      type: 'FIND_RECORDS',
    });
    mockInsertStepIds = {
      parentStepId: 'if-else',
      nextStepId: 'configured-action',
      position: { x: 100, y: 200 },
      connectionOptions: {
        connectedStepType: 'IF_ELSE',
        settings: { branchId: 'if' },
      },
    };
  });

  it('does not overwrite insertion with a new branch built from the old step', async () => {
    const user = userEvent.setup();
    render(<SidePanelWorkflowCreateStepContent />);
    await user.click(screen.getByRole('button', { name: 'Search Records' }));
    await waitFor(() => expect(mockOpenWorkflowEditStep).toHaveBeenCalled());
    expect(mockCreateStep).toHaveBeenCalledWith(
      expect.objectContaining({
        parentStepId: 'if-else',
        nextStepId: 'configured-action',
        connectionOptions: {
          connectedStepType: 'IF_ELSE',
          settings: { branchId: 'if' },
        },
      }),
    );
    expect(mockUpdateStep).not.toHaveBeenCalled();
  });

  it('still creates a branch when extending the If/Else node onto empty space', async () => {
    mockInsertStepIds = {
      parentStepId: 'if-else',
      nextStepId: undefined,
      position: { x: 100, y: 200 },
    };
    const user = userEvent.setup();
    render(<SidePanelWorkflowCreateStepContent />);
    await user.click(screen.getByRole('button', { name: 'Search Records' }));
    await waitFor(() => expect(mockOpenWorkflowEditStep).toHaveBeenCalled());
    expect(mockUpdateStep).toHaveBeenCalledTimes(1);
    expect(mockUpdateStep.mock.calls[0][0].settings.input.branches).toEqual([
      mockParentStep.settings.input.branches[0],
      expect.objectContaining({ nextStepIds: ['inserted'] }),
      mockParentStep.settings.input.branches[1],
    ]);
  });
});
