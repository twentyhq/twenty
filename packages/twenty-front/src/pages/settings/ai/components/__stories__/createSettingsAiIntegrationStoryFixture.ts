import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import {
  currentWorkspaceState,
  type CurrentWorkspace,
} from '@/auth/states/currentWorkspaceState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { graphql, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import { CustomError, isDefined } from 'twenty-shared/utils';
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
import { createSettingsAiAssistantStoryFixture } from '~/pages/settings/ai/components/__stories__/createSettingsAiAssistantStoryFixture';

type SettingsAiIntegrationStoryOptions = {
  permissionFlags: PermissionFlagType[];
  isInboxEnabled: boolean;
  shouldFailAssistantLoad?: boolean;
  shouldPauseAssistantLoad?: boolean;
  hasInvalidAssistantProfile?: boolean;
};

export const createSettingsAiIntegrationStoryFixture = () => {
  const saveInstructions = fn();
  const saveBehavior = fn();
  const loadSystemPrompts = fn();
  let pendingBehaviorSave: Promise<void> | undefined;
  let releaseBehaviorSave: (() => void) | undefined;
  let shouldFailNextBehaviorSave = false;
  let resetGeneration = 0;
  let permissionFlags: PermissionFlagType[] = [];
  let hasLoadedInitialUser = false;
  let initialAssistantProfile: CurrentWorkspace['aiChatAssistantProfile'] =
    mockCurrentWorkspace.aiChatAssistantProfile;
  let workspace: CurrentWorkspace = {
    ...mockCurrentWorkspace,
    aiAdditionalInstructions: null,
  };
  const assistant = createSettingsAiAssistantStoryFixture({
    getWorkspace: () => workspace,
  });

  const reset = async (options: SettingsAiIntegrationStoryOptions) => {
    resetGeneration += 1;
    assistant.reset(options);
    resumeBehaviorSave();
    await mockedApolloClient.clearStore();
    saveInstructions.mockClear();
    saveBehavior.mockClear();
    loadSystemPrompts.mockClear();
    shouldFailNextBehaviorSave = false;
    permissionFlags = options.permissionFlags;
    hasLoadedInitialUser = false;
    initialAssistantProfile = {
      ...assistant.getProfile(),
      displayName: options.hasInvalidAssistantProfile
        ? ''
        : assistant.getProfile().displayName,
    };
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
    jotaiStore.set(isCurrentUserLoadedState.atom, false);
    jotaiStore.set(currentWorkspaceState.atom, {
      ...workspace,
      aiChatAssistantProfile: initialAssistantProfile,
    });
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
    if (isDefined(pendingBehaviorSave)) {
      return;
    }

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
      throw new CustomError('Saved workspace was not returned');
    }

    jotaiStore.set(currentWorkspaceState.atom, {
      ...savedWorkspace,
      workspaceCustomApplication:
        savedWorkspace.workspaceCustomApplication ?? null,
    });
  };

  const handlers = [
    ...assistant.handlers,
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
    graphql.query('GetCurrentUser', async () => {
      const isInitialUserLoad = !hasLoadedInitialUser;
      hasLoadedInitialUser = true;
      const loadErrorResponse = isInitialUserLoad
        ? undefined
        : await assistant.load();

      if (isDefined(loadErrorResponse)) {
        return loadErrorResponse;
      }

      return HttpResponse.json({
        data: {
          currentUser: {
            ...mockedUserData,
            currentWorkspace: {
              ...workspace,
              aiChatAssistantProfile: {
                ...(isInitialUserLoad
                  ? initialAssistantProfile
                  : assistant.getProfile()),
                __typename: 'AiChatAssistantProfile',
              },
            },
            currentUserWorkspace: {
              ...mockedUserData.currentUserWorkspace,
              id: 'ai-settings-user-workspace',
              permissionFlags,
            },
          },
        },
      });
    }),
    graphql.mutation<UpdateWorkspaceMutation, UpdateWorkspaceMutationVariables>(
      'UpdateWorkspace',
      async ({ variables }) => {
        if (isDefined(variables.input.aiChatAssistantProfile)) {
          return assistant.save(variables.input);
        }

        const requestGeneration = resetGeneration;
        const hasBehaviorUpdate =
          isDefined(variables.input.aiChatDirectMessageAssistantMode) ||
          isDefined(variables.input.aiChatInboxAssistantMode);
        const hasInstructionsUpdate =
          'aiAdditionalInstructions' in variables.input;
        const pendingSave = hasBehaviorUpdate ? pendingBehaviorSave : undefined;
        const shouldRejectBehaviorSave =
          hasBehaviorUpdate && shouldFailNextBehaviorSave;

        if (hasBehaviorUpdate) {
          saveBehavior(variables.input);
          shouldFailNextBehaviorSave = false;
        }

        if (isDefined(pendingSave)) {
          await pendingSave;
        }

        if (requestGeneration !== resetGeneration) {
          return HttpResponse.error();
        }

        if (shouldRejectBehaviorSave) {
          return HttpResponse.json({
            errors: [
              {
                message: 'Behavior settings could not be saved',
                extensions: {
                  userFriendlyMessage:
                    'You do not have permission to change this behavior.',
                },
              },
            ],
          });
        }

        workspace = {
          ...workspace,
          aiAdditionalInstructions: hasInstructionsUpdate
            ? (variables.input.aiAdditionalInstructions ?? null)
            : workspace.aiAdditionalInstructions,
          aiChatDirectMessageAssistantMode:
            variables.input.aiChatDirectMessageAssistantMode ??
            workspace.aiChatDirectMessageAssistantMode,
          aiChatInboxAssistantMode:
            variables.input.aiChatInboxAssistantMode ??
            workspace.aiChatInboxAssistantMode,
        };

        if (hasInstructionsUpdate) {
          saveInstructions(variables.input);
        }

        return HttpResponse.json({
          data: {
            updateWorkspace: {
              ...workspace,
              __typename: 'Workspace',
              aiChatAssistantProfile: {
                ...assistant.getProfile(),
                __typename: 'AiChatAssistantProfile',
              },
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
    assistant,
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
