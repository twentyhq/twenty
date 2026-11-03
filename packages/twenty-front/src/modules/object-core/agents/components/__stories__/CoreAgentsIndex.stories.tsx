import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { CatalogDecorator } from 'twenty-ui/testing';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchMetadataOperationBrowserEvent } from '@/browser-event/utils/dispatchMetadataOperationBrowserEvent';
import { CoreAgentsIndex } from '@/object-core/agents/components/CoreAgentsIndex';
import { CORE_AGENTS_STORY_AGENTS } from '@/object-core/agents/components/__stories__/coreAgentsStoryAgents';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  type DeleteOneAgentMutation,
  type DeleteOneAgentMutationVariables,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { MemoryRouter } from 'react-router-dom';
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { AppPath } from 'twenty-shared/types';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const [leadAgent, followUpAgent, remoteAgent] = CORE_AGENTS_STORY_AGENTS;
let availableAgents = CORE_AGENTS_STORY_AGENTS;
let failedDeletionIds = new Set<string>();

const meta = {
  title: 'Modules/ObjectCore/Agents/CoreAgentsIndex',
  component: CoreAgentsIndex,
  decorators: [
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    CatalogDecorator,
    IconsProviderDecorator,
    (Story) => (
      <MemoryRouter initialEntries={[getAppPath(AppPath.AgentIndexPage)]}>
        <MemoryRouterAppNavigatorProvider>
          <Story />
        </MemoryRouterAppNavigatorProvider>
      </MemoryRouter>
    ),
    ToastDecorator,
    (Story) => (
      <HelmetProvider>
        <Story />
      </HelmetProvider>
    ),
  ],
  parameters: {
    currentUserWorkspace: {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [PermissionFlagType.AI_SETTINGS],
    },
    catalog: { options: { elementContainer: { width: 1000, height: 600 } } },
    msw: {
      handlers: [
        graphql.query('FindManyAgents', () =>
          HttpResponse.json({ data: { findManyAgents: availableAgents } }),
        ),
        graphql.mutation<
          DeleteOneAgentMutation,
          DeleteOneAgentMutationVariables
        >('DeleteOneAgent', ({ variables }) => {
          const agent = availableAgents.find(
            ({ id }) => id === variables.input.id,
          );

          if (!isDefined(agent)) {
            return HttpResponse.json({
              errors: [{ message: 'Agent not found' }],
            });
          }

          if (failedDeletionIds.has(agent.id)) {
            failedDeletionIds = new Set();

            return HttpResponse.json({
              errors: [
                { message: 'This agent could not be deleted. Try again.' },
              ],
            });
          }

          availableAgents = availableAgents.filter(({ id }) => id !== agent.id);

          return HttpResponse.json({ data: { deleteOneAgent: agent } });
        }),
      ],
    },
  },
  beforeEach: () => {
    availableAgents = [...CORE_AGENTS_STORY_AGENTS];
    failedDeletionIds = new Set([followUpAgent.id]);
    mockedApolloClient.cache.restore({});
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    jotaiStore.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [PermissionFlagType.AI_SETTINGS],
    });
    jotaiStore.set(coreAgentsFilterSettingsState.atom, {});
  },
} satisfies Meta<typeof CoreAgentsIndex>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SelectionAndPartialDeletion: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await canvas.findByText(leadAgent.label);
    await expect(
      canvas.getByRole('button', { name: 'Create agent' }),
    ).toBeVisible();
    await expect(
      canvas.getAllByRole('checkbox', { name: 'Select row' }),
    ).toHaveLength(3);
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select all loaded rows' }),
    );
    await expect(await canvas.findByText('3 selected')).toBeVisible();

    availableAgents = availableAgents.filter(({ id }) => id !== remoteAgent.id);
    dispatchMetadataOperationBrowserEvent({
      metadataName: 'agent',
      operation: { type: 'delete', deletedRecordId: remoteAgent.id },
    });

    await waitFor(() =>
      expect(canvas.queryByText(remoteAgent.label)).not.toBeInTheDocument(),
    );
    await expect(await canvas.findByText('2 selected')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Delete selected agents' }),
    );

    const confirmation = await body.findByRole('dialog', {
      name: 'Delete 2 agents?',
    });
    await userEvent.click(
      within(confirmation).getByRole('button', { name: 'Delete agents' }),
    );

    await waitFor(() =>
      expect(canvas.queryByText(leadAgent.label)).not.toBeInTheDocument(),
    );
    await expect(await canvas.findByText('1 selected')).toBeVisible();
    await expect(
      canvas.getByRole('checkbox', { name: 'Select row' }),
    ).toBeChecked();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Delete selected agents' }),
    );

    const retryConfirmation = await body.findByRole('dialog', {
      name: 'Delete agent?',
    });
    await userEvent.click(
      within(retryConfirmation).getByRole('button', { name: 'Delete agent' }),
    );
    await waitFor(() =>
      expect(canvas.queryByText(followUpAgent.label)).not.toBeInTheDocument(),
    );
    await expect(canvas.queryByText('1 selected')).not.toBeInTheDocument();

    availableAgents = availableAgents.map((agent) => ({
      ...agent,
      label: 'Managed assistant updated',
    }));
    window.dispatchEvent(new CustomEvent(SSE_CLIENT_RECONNECTED_EVENT_NAME));
    await expect(
      await canvas.findByText('Managed assistant updated'),
    ).toBeVisible();
  },
};
