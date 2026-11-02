import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import {
  currentWorkspaceState,
  type CurrentWorkspace,
} from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { delay, graphql, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  GetCurrentUserDocument,
  type PermissionFlagType,
  type UpdateWorkspaceMutation,
  type UpdateWorkspaceMutationVariables,
} from '~/generated-metadata/graphql';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const WORKSPACE_SAVE_DELAY_MILLISECONDS = 100;

type SettingsAiIntegrationStoryOptions = {
  permissionFlags: PermissionFlagType[];
  isInboxEnabled: boolean;
};

export const createSettingsAiIntegrationStoryFixture = () => {
  const saveInstructions = fn();
  const saveBehavior = fn();
  const loadSystemPrompts = fn();
  let pendingBehaviorSave: Promise<void> | undefined;
  let releaseBehaviorSave: (() => void) | undefined;
  let shouldFailNextBehaviorSave = false;
  let permissionFlags: PermissionFlagType[] = [];
  let workspace: CurrentWorkspace = {
    ...mockCurrentWorkspace,
    aiAdditionalInstructions: null,
  };

  const reset = async (options: SettingsAiIntegrationStoryOptions) => {
    releaseBehaviorSave?.();
    pendingBehaviorSave = undefined;
    releaseBehaviorSave = undefined;
    await mockedApolloClient.clearStore();
    saveInstructions.mockClear();
    saveBehavior.mockClear();
    loadSystemPrompts.mockClear();
    shouldFailNextBehaviorSave = false;
    permissionFlags = options.permissionFlags;
    workspace = {
      ...mockCurrentWorkspace,
      aiAdditionalInstructions: null,
      featureFlags: [
        {
          __typename: 'FeatureFlag',
          key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
          value: options.isInboxEnabled,
        },
      ],
    };
    jotaiStore.set(isCookieAuthActiveState.atom, true);
    jotaiStore.set(currentWorkspaceState.atom, workspace);
    jotaiStore.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags,
    });
    jotaiStore.set(
      activeTabIdComponentState.atomFamily({
        instanceId: SETTINGS_AI_TABS.COMPONENT_INSTANCE_ID,
      }),
      null,
    );
  };

  const failNextBehaviorSave = () => {
    shouldFailNextBehaviorSave = true;
  };

  const pauseBehaviorSave = () => {
    pendingBehaviorSave = new Promise<void>((resolve) => {
      releaseBehaviorSave = resolve;
    });
  };

  const resumeBehaviorSave = () => {
    releaseBehaviorSave?.();
    pendingBehaviorSave = undefined;
    releaseBehaviorSave = undefined;
  };

  const reloadWorkspace = async () => {
    await mockedApolloClient.clearStore();
    const result = await mockedApolloClient.query({
      query: GetCurrentUserDocument,
      fetchPolicy: 'no-cache',
    });
    const savedWorkspace = result.data?.currentUser.currentWorkspace;

    if (!isDefined(savedWorkspace)) {
      throw new Error('Saved workspace was not returned');
    }

    jotaiStore.set(currentWorkspaceState.atom, {
      ...savedWorkspace,
      workspaceCustomApplication:
        savedWorkspace.workspaceCustomApplication ?? null,
    });
  };

  const handlers = [
    graphql.query('GetAgentChatOpenThreadsSummary', () =>
      HttpResponse.json({
        data: {
          agentChatOpenThreadsSummary: {
            __typename: 'AgentChatOpenThreadsSummary',
            openThreadCount: 0,
            unreadOpenThreadCount: 0,
            needsInputThreadCount: 0,
            mentionThreadCount: 0,
            assignedToMeThreadCount: 0,
            assignedThreadCount: 0,
            unassignedThreadCount: 0,
            hasUnreadOpenThread: false,
            hasUnreadMentionThread: false,
            hasUnreadAssignedThread: false,
          },
        },
      }),
    ),
    graphql.query('MyConnectedAccounts', () =>
      HttpResponse.json({ data: { myConnectedAccounts: [] } }),
    ),
    graphql.query('GetCurrentUser', () =>
      HttpResponse.json({
        data: {
          currentUser: {
            ...mockedUserData,
            currentWorkspace: workspace,
            currentUserWorkspace: {
              ...mockedUserData.currentUserWorkspace,
              id: 'ai-settings-user-workspace',
              permissionFlags,
            },
          },
        },
      }),
    ),
    graphql.mutation<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>(
      'UpdateWorkspace',
      async ({ variables }) => {
        const hasBehaviorUpdate =
          isDefined(variables.input.aiChatDirectMessageAssistantMode) ||
          isDefined(variables.input.aiChatInboxAssistantMode);

        if (hasBehaviorUpdate) {
          saveBehavior(variables.input);
        }

        await delay(WORKSPACE_SAVE_DELAY_MILLISECONDS);

        if (hasBehaviorUpdate && isDefined(pendingBehaviorSave)) {
          await pendingBehaviorSave;
        }

        if (hasBehaviorUpdate && shouldFailNextBehaviorSave) {
          shouldFailNextBehaviorSave = false;

          return HttpResponse.json({
            errors: [{ message: 'Behavior settings could not be saved' }],
          });
        }

        workspace = {
          ...workspace,
          aiAdditionalInstructions:
            'aiAdditionalInstructions' in variables.input
              ? (variables.input.aiAdditionalInstructions ?? null)
              : workspace.aiAdditionalInstructions,
          aiChatDirectMessageAssistantMode:
            variables.input.aiChatDirectMessageAssistantMode ??
            workspace.aiChatDirectMessageAssistantMode,
          aiChatInboxAssistantMode:
            variables.input.aiChatInboxAssistantMode ??
            workspace.aiChatInboxAssistantMode,
        };

        if ('aiAdditionalInstructions' in variables.input) {
          saveInstructions(variables.input);
        }

        return HttpResponse.json({
          data: {
            updateWorkspace: {
              ...workspace,
              __typename: 'Workspace',
              customDomain: workspace.customDomain ?? null,
              displayName: workspace.displayName ?? null,
              logo: workspace.logo ?? null,
              defaultRole: null,
            },
          },
        });
      },
    ),
    graphql.query('GetAiSystemPromptPreview', () => {
      loadSystemPrompts();
      return HttpResponse.json({
        data: {
          getAiSystemPromptPreview: {
            __typename: 'AiSystemPromptPreview',
            estimatedTokenCount: 12400,
            sections: [],
          },
        },
      });
    }),
    ...graphqlMocks.handlers,
  ];

  return {
    reset,
    handlers,
    saveInstructions,
    saveBehavior,
    loadSystemPrompts,
    failNextBehaviorSave,
    pauseBehaviorSave,
    resumeBehaviorSave,
    reloadWorkspace,
  };
};
