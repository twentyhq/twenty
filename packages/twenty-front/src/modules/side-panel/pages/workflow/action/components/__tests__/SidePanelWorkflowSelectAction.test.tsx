import { MockedProvider } from '@apollo/client/testing/react';
import { i18n, type MessageDescriptor } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { SidePanelWorkflowSelectAction } from '@/side-panel/pages/workflow/action/components/SidePanelWorkflowSelectAction';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  FindManyAgentsDocument,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

let mockFeatureFlagsMap: Record<string, boolean> = {};

jest.mock('@/workspace/hooks/useWorkspaceFeatureFlagsMap', () => ({
  useWorkspaceFeatureFlagsMap: () => mockFeatureFlagsMap,
}));

jest.mock(
  '@/side-panel/pages/workflow/action/components/WorkflowActionMenuItems',
  () => ({
    WorkflowActionMenuItems: ({
      actions,
    }: {
      actions: {
        defaultLabel: MessageDescriptor;
        type: string;
      }[];
    }) => {
      const { i18n: mockI18n } = jest.requireActual('@lingui/core');

      return (
        <>
          {actions.map((action) => (
            <div key={action.type}>{mockI18n._(action.defaultLabel)}</div>
          ))}
        </>
      );
    },
  }),
);

const buildAgent = ({
  id,
  label,
  responseFormat,
}: {
  id: string;
  label: string;
  responseFormat: object | null;
}) => ({
  __typename: 'Agent' as const,
  id,
  name: id,
  label,
  description: null,
  icon: null,
  prompt: 'Prompt',
  modelId: 'workspace-default-model',
  responseFormat,
  roleId: null,
  isSystem: false,
  isActive: true,
  modelConfiguration: null,
  triggers: [],
  applicationId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const FIND_MANY_AGENTS_MOCK = {
  request: { query: FindManyAgentsDocument },
  result: {
    data: {
      findManyAgents: [
        buildAgent({
          id: 'lead-scorer',
          label: 'Lead scorer',
          responseFormat: {
            type: 'json',
            schema: {
              type: 'object',
              properties: { score: { type: 'number' } },
            },
          },
        }),
        buildAgent({
          id: 'chat-helper',
          label: 'Chat helper',
          responseFormat: { type: 'text' },
        }),
      ],
    },
  },
};

const renderPicker = (onActionSelected = jest.fn()) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <MockedProvider mocks={[FIND_MANY_AGENTS_MOCK]}>
        <I18nProvider i18n={i18n}>
          <SidePanelWorkflowSelectAction onActionSelected={onActionSelected} />
        </I18nProvider>
      </MockedProvider>
    </JotaiProvider>,
  );

describe('SidePanelWorkflowSelectAction', () => {
  beforeEach(() => {
    resetJotaiStore();
    mockFeatureFlagsMap = {};
  });

  it('hides Wait for Event while the inbox feature flag is off', () => {
    renderPicker();

    expect(screen.queryByText('Wait for Event')).not.toBeInTheDocument();
    expect(screen.getByText('Delay')).toBeInTheDocument();
  });

  it('offers Wait for Event once the inbox feature flag is on', () => {
    mockFeatureFlagsMap = { [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED]: true };

    renderPicker();

    expect(screen.getByText('Wait for Event')).toBeInTheDocument();
  });

  it('offers a Generate step', () => {
    renderPicker();

    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  it('lists only the agents with a JSON output, each creating a step that runs it', async () => {
    const onActionSelected = jest.fn();

    renderPicker(onActionSelected);

    await userEvent.click(await screen.findByText('Lead scorer'));

    expect(screen.queryByText('Chat helper')).not.toBeInTheDocument();
    expect(onActionSelected).toHaveBeenCalledWith({
      type: 'AI_AGENT',
      defaultSettings: { input: { agentId: 'lead-scorer' } },
    });
  });
});
