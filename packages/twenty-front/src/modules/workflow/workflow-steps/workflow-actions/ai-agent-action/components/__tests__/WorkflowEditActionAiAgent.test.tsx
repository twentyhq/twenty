import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionAiAgent } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowEditActionAiAgent';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useQuery: () => ({ data: undefined, loading: false }),
}));
jest.mock('@/workflow/workflow-steps/components/WorkflowStepFooter', () => ({
  WorkflowStepFooter: () => null,
}));
jest.mock(
  '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnSidePanelClose',
  () => ({
    useResetWorkflowAiAgentPermissionsStateOnSidePanelClose: jest.fn(),
  }),
);

const deletedAgentStep: WorkflowAiAgentAction = {
  id: 'ai-step-id',
  name: 'Agent',
  type: 'AI_AGENT',
  valid: true,
  settings: {
    input: { agentId: 'deleted-agent-id', prompt: 'Qualify the lead' },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

describe('WorkflowEditActionAiAgent', () => {
  it('tells the author when the agent the step runs is missing', async () => {
    render(
      <WorkflowEditActionAiAgent
        action={deletedAgentStep}
        actionOptions={{ onActionUpdate: jest.fn() }}
      />,
      {
        wrapper: ({ children }) => (
          <MemoryRouter>
            <I18nProvider i18n={i18n}>
              <JotaiProvider store={createStore()}>{children}</JotaiProvider>
            </I18nProvider>
          </MemoryRouter>
        ),
      },
    );

    expect(
      await screen.findByText(
        'The agent this step runs could not be loaded. It may have been deleted.',
      ),
    ).toBeVisible();
  });
});
