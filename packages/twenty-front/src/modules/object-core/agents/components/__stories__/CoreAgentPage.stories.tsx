import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { CORE_AGENT_AVATAR_STORY_AGENT } from '@/object-core/agents/components/__stories__/coreAgentAvatarStoryAgent';
import { CoreAgentPageExample } from '@/object-core/agents/components/__stories__/CoreAgentPageExample';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  FeatureFlagKey,
  PermissionFlagType,
  type UpdateOneAgentMutation,
  type UpdateOneAgentMutationVariables,
} from '~/generated-metadata/graphql';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import {
  mockedUserData,
  mockCurrentWorkspace,
} from '~/testing/mock-data/users';

let remoteAgent = CORE_AGENT_AVATAR_STORY_AGENT;

const meta = {
  title: 'Modules/ObjectCore/Agents/CoreAgentPage',
  component: CoreAgentPageExample,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    IconsProviderDecorator,
    ToastDecorator,
  ],
  beforeEach: () => {
    remoteAgent = CORE_AGENT_AVATAR_STORY_AGENT;
    mockedApolloClient.cache.restore({});
    jotaiStore.set(aiModelsState.atom, []);
    jotaiStore.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [PermissionFlagType.AI_SETTINGS],
    });
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      workspaceCustomApplication: {
        ...mockCurrentWorkspace.workspaceCustomApplication,
        id:
          remoteAgent.applicationId ??
          mockCurrentWorkspace.workspaceCustomApplication.id,
      },
      featureFlags: [
        {
          __typename: 'FeatureFlag',
          key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
          value: true,
        },
      ],
    });
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneAgent', () =>
          HttpResponse.json({ data: { findOneAgent: remoteAgent } }),
        ),
        graphql.query('GetAgentRuns', () =>
          HttpResponse.json({ data: { agentRuns: [] } }),
        ),
        graphql.mutation<
          UpdateOneAgentMutation,
          UpdateOneAgentMutationVariables
        >('UpdateOneAgent', ({ variables }) => {
          const label = variables.input.label?.trim() ?? remoteAgent.label;
          remoteAgent = {
            ...remoteAgent,
            label,
            name: computeMetadataNameFromLabel({ label }),
            prompt: variables.input.prompt ?? remoteAgent.prompt,
            description: variables.input.description ?? remoteAgent.description,
            modelId: variables.input.modelId ?? remoteAgent.modelId,
            modelConfiguration:
              variables.input.modelConfiguration ??
              remoteAgent.modelConfiguration,
            triggers: variables.input.triggers ?? remoteAgent.triggers,
            avatarColor: variables.input.avatarColor ?? remoteAgent.avatarColor,
            avatarShape: variables.input.avatarShape ?? remoteAgent.avatarShape,
          };
          return HttpResponse.json({ data: { updateOneAgent: remoteAgent } });
        }),
      ],
    },
  },
} satisfies Meta<typeof CoreAgentPageExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RenameCancelAndRuns: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const instructions = await canvas.findByRole('textbox', {
      name: 'Instructions',
    });
    await userEvent.clear(instructions);
    await userEvent.type(instructions, 'Unsaved instructions');
    await userEvent.click(canvas.getByRole('heading', { name: 'Researcher' }));
    const name = canvas.getByRole('textbox', { name: '' });
    await userEvent.clear(name);
    await userEvent.type(name, 'Renamed researcher{Enter}');
    await canvas.findByRole('heading', { name: 'Renamed researcher' });
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(instructions).toHaveValue(
      CORE_AGENT_AVATAR_STORY_AGENT.prompt,
    );
    await expect(
      canvas.getByRole('heading', { name: 'Renamed researcher' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'See runs' }));
    await canvas.findByText('No runs yet');
    await userEvent.click(canvas.getByRole('button', { name: 'See settings' }));
    await expect(
      await canvas.findByRole('textbox', { name: 'Instructions' }),
    ).toHaveValue(CORE_AGENT_AVATAR_STORY_AGENT.prompt);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete agent' }));
    const dialog = await body.findByRole('dialog', { name: 'Delete agent?' });
    await expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' }),
    );
  },
};

export const ApplicationManaged: Story = {
  beforeEach: () => {
    remoteAgent = { ...remoteAgent, applicationId: 'installed-application' };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('This agent is read-only.'),
    ).toBeVisible();
    await expect(
      canvas.getByRole('textbox', { name: 'Instructions' }),
    ).toBeDisabled();
    await expect(
      canvas.queryByRole('button', { name: 'Change avatar' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Delete agent' }),
    ).not.toBeInTheDocument();
  },
};
