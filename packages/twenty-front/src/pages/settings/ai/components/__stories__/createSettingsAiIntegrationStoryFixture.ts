import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
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
import { getAiChatAssistantProfileSchema } from 'twenty-shared/ai';
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

type SettingsAiIntegrationStoryOptions = {
  permissionFlags: PermissionFlagType[];
  isInboxEnabled: boolean;
};

export const createSettingsAiIntegrationStoryFixture = () => {
  const saveInstructions = fn();
  const saveBehavior = fn();
  const saveAssistantProfile = fn();
  const loadSystemPrompts = fn();
  let pausedSave: Promise<void> | undefined;
  let releasePausedSave: (() => void) | undefined;
  let shouldFailNextBehaviorSave = false;
  let shouldFailNextAssistantSave = false;
  let resetGeneration = 0;
  let permissionFlags: PermissionFlagType[] = [];
  let workspace: CurrentWorkspace = {
    ...mockCurrentWorkspace,
    aiAdditionalInstructions: null,
  };

  const reset = async (options: SettingsAiIntegrationStoryOptions) => {
    resetGeneration += 1;
    resumeSave();
    await mockedApolloClient.clearStore();
    saveInstructions.mockClear();
    saveBehavior.mockClear();
    saveAssistantProfile.mockClear();
    loadSystemPrompts.mockClear();
    shouldFailNextBehaviorSave = false;
    shouldFailNextAssistantSave = false;
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

  const failNextAssistantSave = () => {
    shouldFailNextAssistantSave = true;
  };

  const pauseSave = () => {
    if (isDefined(pausedSave)) {
      return;
    }

    pausedSave = new Promise<void>((resolve) => {
      releasePausedSave = resolve;
    });
  };

  const resumeSave = () => {
    releasePausedSave?.();
    pausedSave = undefined;
    releasePausedSave = undefined;
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
        const requestGeneration = resetGeneration;
        const hasBehaviorUpdate =
          isDefined(variables.input.aiChatDirectMessageAssistantMode) ||
          isDefined(variables.input.aiChatInboxAssistantMode);
        const hasInstructionsUpdate =
          'aiAdditionalInstructions' in variables.input;
        const hasAssistantProfileUpdate = isDefined(
          variables.input.aiChatAssistantProfile,
        );
        const pendingSave =
          hasBehaviorUpdate || hasAssistantProfileUpdate
            ? pausedSave
            : undefined;
        const shouldRejectBehaviorSave =
          hasBehaviorUpdate && shouldFailNextBehaviorSave;
        const shouldRejectAssistantSave =
          hasAssistantProfileUpdate && shouldFailNextAssistantSave;

        if (hasBehaviorUpdate) {
          saveBehavior(variables.input);
          shouldFailNextBehaviorSave = false;
        }

        if (hasAssistantProfileUpdate) {
          saveAssistantProfile(variables.input);
          shouldFailNextAssistantSave = false;
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

        if (shouldRejectAssistantSave) {
          return HttpResponse.json({
            errors: [{ message: 'Assistant settings could not be saved' }],
          });
        }

        workspace = {
          ...workspace,
          aiAdditionalInstructions: hasInstructionsUpdate
            ? (variables.input.aiAdditionalInstructions ?? null)
            : workspace.aiAdditionalInstructions,
          aiChatAssistantProfile: {
            ...workspace.aiChatAssistantProfile,
            ...getAiChatAssistantProfileSchema()
              .partial()
              .parse(variables.input.aiChatAssistantProfile ?? {}),
          },
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
                ...workspace.aiChatAssistantProfile,
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
    reset,
    handlers,
    saveInstructions,
    saveBehavior,
    saveAssistantProfile,
    loadSystemPrompts,
    failNextBehaviorSave,
    failNextAssistantSave,
    pauseSave,
    resumeSave,
    reloadWorkspace,
  };
};
