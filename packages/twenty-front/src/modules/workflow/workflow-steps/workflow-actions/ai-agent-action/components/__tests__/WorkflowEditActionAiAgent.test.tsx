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
import { SettingsPath } from 'twenty-shared/types';
import {
  AssignRoleToAgentDocument,
  CreateOneRoleDocument,
  FindOneAgentDocument,
} from '~/generated-metadata/graphql';

const PUBLISHED_AGENT_ID = 'published-agent-id';
const DRAFT_AGENT_ID = 'draft-agent-id';
const STEP_ID = 'ai-step-id';
const WORKFLOW_VISUALIZER_INSTANCE_ID = 'workflow-visualizer-instance-id';

const mockCreateRole = jest.fn();
const mockAssignRoleToAgent = jest.fn();
const mockNavigateSettings = jest.fn();
const mockGetUpdatableWorkflowVersionStepOrThrow = jest.fn();
let mockAgentRoleId: string | null = null;
let mockFindOneAgentResultsByAgentId: Record<string, unknown> = {};

// a stable result per agent, as Apollo's cache gives, so the editor does not reload the agent on every render
const mockFindOneAgentResult = (agentId: string) => {
  mockFindOneAgentResultsByAgentId[agentId] ??= {
    data: {
      findOneAgent: {
        id: agentId,
        label: 'Lead qualifier',
        isSystem: true,
        roleId: mockAgentRoleId,
      },
    },
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
  useMutation: (document: unknown) => {
    if (document === CreateOneRoleDocument) {
      return [mockCreateRole];
    }

    return document === AssignRoleToAgentDocument
      ? [mockAssignRoleToAgent]
      : [jest.fn()];
  },
}));
jest.mock(
  '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentStepOwnedAgentPromptTab',
  () => ({
    WorkflowAiAgentStepOwnedAgentPromptTab: ({
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
jest.mock(
  '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionsTab',
  () => ({ WorkflowAiAgentPermissionsTab: () => null }),
);
jest.mock('@/workflow/workflow-steps/components/WorkflowStepFooter', () => ({
  WorkflowStepFooter: ({
    additionalActions,
  }: {
    additionalActions?: React.ReactNode[];
  }) => <>{additionalActions}</>,
}));
jest.mock(
  '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnSidePanelClose',
  () => ({
    useResetWorkflowAiAgentPermissionsStateOnSidePanelClose: jest.fn(),
  }),
);
jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: () => ({
    getUpdatableWorkflowVersionStepOrThrow:
      mockGetUpdatableWorkflowVersionStepOrThrow,
  }),
}));
jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => mockNavigateSettings,
}));

const buildLegacyStep = (agentId: string): WorkflowAiAgentAction => ({
  id: STEP_ID,
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
    jest.clearAllMocks();
    jotaiStore = createStore();
    mockAgentRoleId = null;
    mockFindOneAgentResultsByAgentId = {};
  });

  it('saves prompt edits to the agent of the draft its first edit created', async () => {
    const onActionUpdate = jest.fn();
    const publishedStep = buildLegacyStep(PUBLISHED_AGENT_ID);
    const draftStep = buildLegacyStep(DRAFT_AGENT_ID);

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

  it('creates a role for the draft agent of a legacy step that has none, and opens it', async () => {
    const step = buildLegacyStep(PUBLISHED_AGENT_ID);

    setFlowStep(step);
    mockGetUpdatableWorkflowVersionStepOrThrow.mockResolvedValue(
      buildLegacyStep(DRAFT_AGENT_ID),
    );

    render(
      <WorkflowEditActionAiAgent
        action={step}
        actionOptions={{ onActionUpdate: jest.fn() }}
      />,
      { wrapper: Wrapper },
    );

    await userEvent.click(
      await screen.findByRole('tab', { name: 'Permissions' }),
    );
    await userEvent.click(await screen.findByText('Create role'));

    await waitFor(() => expect(mockNavigateSettings).toHaveBeenCalled());

    const createdRoleId =
      mockCreateRole.mock.calls[0][0].variables.createRoleInput.id;

    expect(mockAssignRoleToAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { agentId: DRAFT_AGENT_ID, roleId: createdRoleId },
      }),
    );
    expect(mockNavigateSettings).toHaveBeenCalledWith(SettingsPath.RoleDetail, {
      roleId: createdRoleId,
    });
  });

  it('offers to view the role of a legacy step that has one', async () => {
    mockAgentRoleId = 'role-id';
    const step = buildLegacyStep(PUBLISHED_AGENT_ID);

    setFlowStep(step);

    render(
      <WorkflowEditActionAiAgent
        action={step}
        actionOptions={{ onActionUpdate: jest.fn() }}
      />,
      { wrapper: Wrapper },
    );

    await userEvent.click(
      await screen.findByRole('tab', { name: 'Permissions' }),
    );

    expect(await screen.findByText('View role')).toBeVisible();
    expect(screen.queryByText('Create role')).not.toBeInTheDocument();
  });
});
