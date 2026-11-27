import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

import { CoreAgentTestForm } from '@/object-core/agents/components/CoreAgentTestForm';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockTestCoreAgent = jest.fn();

jest.mock('@/object-core/agents/hooks/useTestCoreAgent', () => ({
  useTestCoreAgent: () => ({
    testCoreAgent: mockTestCoreAgent,
    isTestingCoreAgent: false,
  }),
}));

const agent: CoreAgent = {
  __typename: 'Agent',
  id: 'agent-1',
  universalIdentifier: 'agent-universal-identifier-1',
  name: 'leadQualifier',
  label: 'Lead qualifier',
  description: null,
  icon: null,
  avatarColor: null,
  avatarShape: null,
  prompt: 'Prompt',
  modelId: 'workspace-default-model',
  responseFormat: null,
  roleId: null,
  modelConfiguration: null,
  applicationId: null,
  isSystem: false,
  isActive: true,
  triggers: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const renderForm = (
  agentOverrides: Partial<Pick<CoreAgent, 'triggers'>> = {},
) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

  return render(<CoreAgentTestForm agent={{ ...agent, ...agentOverrides }} />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Wrapper>
        <I18nProvider i18n={i18n}>{children}</I18nProvider>
      </Wrapper>
    ),
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('cannot run a test without a message', () => {
  renderForm();

  expect(screen.getByRole('button', { name: /Run test/ })).toBeDisabled();
});

it('runs the agent with the typed message', async () => {
  renderForm();

  await userEvent.type(
    screen.getByRole('textbox'),
    '  Which workflows ran this week?  ',
  );
  await userEvent.click(screen.getByRole('button', { name: /Run test/ }));

  expect(mockTestCoreAgent).toHaveBeenCalledWith(
    'Which workflows ran this week?',
  );
});

it('explains how a scheduled agent normally runs', () => {
  renderForm({
    triggers: [
      {
        id: '6f1b5a3e-3c3f-4f4a-9a43-0a7f5d6c2b11',
        type: 'CRON',
        isActive: true,
        instructions: 'Send the weekly digest',
        settings: { pattern: '0 9 * * 1' },
      },
    ],
  });

  expect(
    screen.getByText(/This agent normally runs .*, without a message/),
  ).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText('Do your scheduled task now'),
  ).toBeInTheDocument();
});
