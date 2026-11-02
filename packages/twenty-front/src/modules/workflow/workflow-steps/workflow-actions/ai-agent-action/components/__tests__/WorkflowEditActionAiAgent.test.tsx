import { flowComponentState } from '@/workflow/states/flowComponentState';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { WorkflowEditActionAiAgent } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowEditActionAiAgent';
import { type WorkflowAiAgentStepPanelProps } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentStepPanelProps';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';

const PUBLISHED_AGENT_ID = 'published-agent-id';
const DRAFT_AGENT_ID = 'draft-agent-id';
const DELETED_AGENT_ID = 'deleted-agent-id';
const STEP_ID = 'ai-step-id';
const WORKFLOW_VISUALIZER_INSTANCE_ID = 'workflow-visualizer-instance-id';

type MockFindOneAgentResult = {
  data: { findOneAgent: { id: string; label: string } } | undefined;
  loading: boolean;
};

let mockFindOneAgentResultsByAgentId: Record<string, MockFindOneAgentResult> =
  {};

// a stable result per agent, as Apollo's cache gives, so the editor does not reload the agent on every render
const mockFindOneAgentResult = (agentId: string): MockFindOneAgentResult => {
  if (agentId === DELETED_AGENT_ID) {
    return { data: undefined, loading: false };
  }

  mockFindOneAgentResultsByAgentId[agentId] ??= {
    data: { findOneAgent: { id: agentId, label: 'Lead qualifier' } },
    loading: false,
  };

  return mockFindOneAgentResultsByAgentId[agentId];
};

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useQuery: (document: unknown, options: { variables: { id: string } }) =>
    document === FindOneAgentDocument
      ? mockFindOneAgentResult(options.variables.id)
      : { data: undefined, loading: false },
}));
jest.mock(
  '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentAgentStepPromptTab',
  () => ({
    WorkflowAiAgentAgentStepPromptTab: ({
      input,
      onInputChange,
    }: WorkflowAiAgentStepPanelProps) => (
      <textarea
        aria-label="Prompt"
        defaultValue={input.prompt}
        onChange={(event) => onInputChange({ prompt: event.target.value })}
      />
    ),
  }),
);
jest.mock('@/workflow/workflow-steps/components/WorkflowStepFooter', () => ({
  WorkflowStepFooter: () => null,
}));
jest.mock(
  '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnSidePanelClose',
  () => ({
    useResetWorkflowAiAgentPermissionsStateOnSidePanelClose: jest.fn(),
  }),
);

const buildAgentStep = ({
  agentId,
  stepId = STEP_ID,
}: {
  agentId: string;
  stepId?: string;
}): WorkflowAiAgentAction => ({
  id: stepId,
  name: 'Agent',
  type: 'AI_AGENT',
  valid: true,
  settings: {
    input: { agentId, prompt: 'Qualify the lead' },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
});

let jotaiStore: ReturnType<typeof createStore>;

const setFlowStep = (step: WorkflowAiAgentAction) =>
  jotaiStore.set(
    flowComponentState.atomFamily({
      instanceId: WORKFLOW_VISUALIZER_INSTANCE_ID,
    }),
    { workflowVersionId: 'workflow-version-id', trigger: null, steps: [step] },
  );

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <WorkflowVisualizerComponentInstanceContext.Provider
          value={{ instanceId: WORKFLOW_VISUALIZER_INSTANCE_ID }}
        >
          {children}
        </WorkflowVisualizerComponentInstanceContext.Provider>
      </JotaiProvider>
    </I18nProvider>
  </MemoryRouter>
);

describe('WorkflowEditActionAiAgent', () => {
  beforeEach(() => {
    jotaiStore = createStore();
    mockFindOneAgentResultsByAgentId = {};
  });

  it('saves prompt edits to the agent of the draft its first edit created', async () => {
    const onActionUpdate = jest.fn();
    const publishedStep = buildAgentStep({ agentId: PUBLISHED_AGENT_ID });
    const draftStep = buildAgentStep({ agentId: DRAFT_AGENT_ID });

    setFlowStep(publishedStep);

    const { rerender } = render(
      <WorkflowEditActionAiAgent
        action={publishedStep}
        actionOptions={{ onActionUpdate }}
      />,
      { wrapper: Wrapper },
    );

    setFlowStep(draftStep);
    rerender(
      <WorkflowEditActionAiAgent
        action={draftStep}
        actionOptions={{ onActionUpdate }}
      />,
    );

    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Prompt' }),
      ' now',
    );

    await waitFor(() => expect(onActionUpdate).toHaveBeenCalled(), {
      timeout: 2000,
    });

    expect(onActionUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({
          input: expect.objectContaining({
            agentId: DRAFT_AGENT_ID,
            prompt: 'Qualify the lead now',
          }),
        }),
      }),
    );
  });

  it('does not save an edit to a step that left the flow before the save ran', async () => {
    const onActionUpdate = jest.fn();
    const step = buildAgentStep({ agentId: PUBLISHED_AGENT_ID });

    setFlowStep(step);

    render(
      <WorkflowEditActionAiAgent
        action={step}
        actionOptions={{ onActionUpdate }}
      />,
      { wrapper: Wrapper },
    );

    await userEvent.type(
      await screen.findByRole('textbox', { name: 'Prompt' }),
      ' now',
    );
    jotaiStore.set(
      flowComponentState.atomFamily({
        instanceId: WORKFLOW_VISUALIZER_INSTANCE_ID,
      }),
      { workflowVersionId: 'workflow-version-id', trigger: null, steps: [] },
    );

    await new Promise((resolve) => setTimeout(resolve, 700));

    expect(onActionUpdate).not.toHaveBeenCalled();
  });

  it('tells the author when the agent the step runs is missing', async () => {
    const step = buildAgentStep({ agentId: DELETED_AGENT_ID });

    setFlowStep(step);
    render(
      <WorkflowEditActionAiAgent
        action={step}
        actionOptions={{ onActionUpdate: jest.fn() }}
      />,
      { wrapper: Wrapper },
    );

    expect(
      await screen.findByText(
        'The agent this step runs could not be loaded. It may have been deleted.',
      ),
    ).toBeVisible();
  });
});
