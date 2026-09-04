import { SidePanelWorkflowCreateStepContent } from '@/side-panel/pages/workflow/step/create/components/SidePanelWorkflowCreateStepContent';
import { type WorkflowActionSelection } from '@/side-panel/pages/workflow/action/components/SidePanelWorkflowSelectAction';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowIfElseAction } from '@/workflow/types/Workflow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type StartNodeCreationParams } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const mockCreateStep = jest.fn();
const mockUpdateStep = jest.fn();
const mockOpenWorkflowEditStep = jest.fn();
let mockInsertStepIds: StartNodeCreationParams & {
  parentStepId: string | undefined;
  nextStepId: string | undefined;
};
let jotaiStore: ReturnType<typeof createStore>;
const workflowVisualizerComponentInstanceId = 'workflow-visualizer-instance-id';
const mockParentStep: WorkflowIfElseAction = {
  id: 'if-else',
  type: 'IF_ELSE',
  name: 'If/Else',
  valid: true,
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
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
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

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{ instanceId: workflowVisualizerComponentInstanceId }}
    >
      {children}
    </WorkflowVisualizerComponentInstanceContext.Provider>
  </JotaiProvider>
);

const renderContent = () => {
  jotaiStore.set(
    workflowInsertStepIdsComponentState.atomFamily({
      instanceId: workflowVisualizerComponentInstanceId,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    mockInsertStepIds,
  );

  return render(<SidePanelWorkflowCreateStepContent />, { wrapper: Wrapper });
};

describe('SidePanelWorkflowCreateStepContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jotaiStore = createStore();
    jotaiStore.set(
      workflowVisualizerWorkflowIdComponentState.atomFamily({
        instanceId: workflowVisualizerComponentInstanceId,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      'workflow-id',
    );
    jotaiStore.set(
      flowComponentState.atomFamily({
        instanceId: workflowVisualizerComponentInstanceId,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      {
        workflowVersionId: 'workflow-version-id',
        trigger: null,
        steps: [mockParentStep],
      },
    );
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
    renderContent();
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
    renderContent();
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
