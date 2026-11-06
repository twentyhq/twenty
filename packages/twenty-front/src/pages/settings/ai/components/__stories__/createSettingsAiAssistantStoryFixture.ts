import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { graphql, HttpResponse } from 'msw';
import { fn } from 'storybook/test';
import {
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  getAiChatAssistantProfileSchema,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';
import { CustomError, isDefined } from 'twenty-shared/utils';
import {
  type UpdateWorkspaceMutation,
  type UpdateWorkspaceMutationVariables,
} from '~/generated-metadata/graphql';

export const createSettingsAiAssistantStoryFixture = ({
  getWorkspace,
}: {
  getWorkspace: () => CurrentWorkspace;
}) => {
  const loadProfile = fn();
  const saveProfile = fn();
  const resetProfile = fn();
  let profile: AiChatAssistantProfile = DEFAULT_AI_CHAT_ASSISTANT_PROFILE;
  let pendingLoad: Promise<void> | undefined;
  let releaseLoad: (() => void) | undefined;
  let pendingSave: Promise<void> | undefined;
  let releaseSave: (() => void) | undefined;
  let shouldFailNextLoad = false;
  let shouldFailNextSave = false;
  let generation = 0;

  const resumeLoad = () => {
    releaseLoad?.();
    pendingLoad = undefined;
    releaseLoad = undefined;
  };

  const resumeSave = () => {
    releaseSave?.();
    pendingSave = undefined;
    releaseSave = undefined;
  };

  const pauseLoad = () => {
    pendingLoad = new Promise<void>((resolve) => {
      releaseLoad = resolve;
    });
  };

  const reset = ({
    shouldFailAssistantLoad = false,
    shouldPauseAssistantLoad = false,
  }: {
    shouldFailAssistantLoad?: boolean;
    shouldPauseAssistantLoad?: boolean;
  }) => {
    generation += 1;
    resumeLoad();
    resumeSave();
    loadProfile.mockClear();
    saveProfile.mockClear();
    resetProfile.mockClear();
    profile = DEFAULT_AI_CHAT_ASSISTANT_PROFILE;
    shouldFailNextLoad = shouldFailAssistantLoad;
    shouldFailNextSave = false;

    if (shouldPauseAssistantLoad) {
      pauseLoad();
    }
  };

  const setProfile = (patch: Partial<AiChatAssistantProfile>) => {
    profile = { ...profile, ...patch };
  };

  const save = async (input: UpdateWorkspaceMutationVariables['input']) => {
    const requestGeneration = generation;
    const shouldRejectSave = shouldFailNextSave;
    shouldFailNextSave = false;
    saveProfile(input);
    await pendingSave;

    if (requestGeneration !== generation) {
      return HttpResponse.error();
    }

    if (shouldRejectSave) {
      return HttpResponse.json({
        errors: [{ message: 'Assistant settings could not be saved' }],
      });
    }

    const result = getAiChatAssistantProfileSchema()
      .partial()
      .strict()
      .safeParse(input.aiChatAssistantProfile);

    if (!result.success) {
      throw new CustomError('Invalid assistant profile patch');
    }

    setProfile(result.data);
    const workspace = getWorkspace();

    return HttpResponse.json<{ data: UpdateWorkspaceMutation }>({
      data: {
        updateWorkspace: {
          ...workspace,
          __typename: 'Workspace',
          aiChatAssistantProfile: {
            ...profile,
            __typename: 'AiChatAssistantProfile',
          },
          customDomain: workspace.customDomain ?? null,
          displayName: workspace.displayName ?? null,
          logo: workspace.logo ?? null,
          defaultRole: null,
        },
      },
    });
  };

  const handlers = [
    graphql.query('GetWorkspaceAiChatAssistantProfile', async () => {
      const requestGeneration = generation;
      const shouldRejectLoad = shouldFailNextLoad;
      shouldFailNextLoad = false;
      loadProfile();
      await pendingLoad;

      if (requestGeneration !== generation) {
        return HttpResponse.error();
      }

      if (shouldRejectLoad) {
        return HttpResponse.json({
          errors: [{ message: 'Assistant settings could not be loaded' }],
        });
      }

      return HttpResponse.json({
        data: {
          currentWorkspace: {
            __typename: 'Workspace',
            id: getWorkspace().id,
            aiChatAssistantProfile: {
              ...profile,
              __typename: 'AiChatAssistantProfile',
            },
          },
        },
      });
    }),
    graphql.mutation('ResetAiChatAssistantProfile', async () => {
      const requestGeneration = generation;
      const shouldRejectSave = shouldFailNextSave;
      shouldFailNextSave = false;
      resetProfile();
      await pendingSave;

      if (requestGeneration !== generation) {
        return HttpResponse.error();
      }

      if (shouldRejectSave) {
        return HttpResponse.json({
          errors: [{ message: 'Assistant settings could not be reset' }],
        });
      }

      profile = DEFAULT_AI_CHAT_ASSISTANT_PROFILE;

      return HttpResponse.json({
        data: {
          resetAiChatAssistantProfile: {
            ...profile,
            __typename: 'AiChatAssistantProfile',
          },
        },
      });
    }),
  ];

  return {
    reset,
    handlers,
    loadProfile,
    saveProfile,
    resetProfile,
    save,
    resumeLoad,
    resumeSave,
    setProfile,
    getProfile: () => profile,
    failNextSave: () => {
      shouldFailNextSave = true;
    },
    pauseSave: () => {
      if (isDefined(pendingSave)) {
        return;
      }

      pendingSave = new Promise<void>((resolve) => {
        releaseSave = resolve;
      });
    },
  };
};
