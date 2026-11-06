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

  const getRequestErrorResponse = async ({
    pendingRequest,
    shouldRejectRequest,
    errorMessage,
  }: {
    pendingRequest: Promise<void> | undefined;
    shouldRejectRequest: boolean;
    errorMessage: string;
  }) => {
    const requestGeneration = generation;
    await pendingRequest;

    if (requestGeneration !== generation) {
      return HttpResponse.error();
    }

    if (!shouldRejectRequest) {
      return undefined;
    }

    return HttpResponse.json({ errors: [{ message: errorMessage }] });
  };

  const save = async (input: UpdateWorkspaceMutationVariables['input']) => {
    const shouldRejectSave = shouldFailNextSave;
    shouldFailNextSave = false;
    saveProfile(input);
    const errorResponse = await getRequestErrorResponse({
      pendingRequest: pendingSave,
      shouldRejectRequest: shouldRejectSave,
      errorMessage: 'Assistant settings could not be saved',
    });

    if (isDefined(errorResponse)) {
      return errorResponse;
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

  const load = async () => {
    const shouldRejectLoad = shouldFailNextLoad;
    shouldFailNextLoad = false;
    loadProfile();

    return getRequestErrorResponse({
      pendingRequest: pendingLoad,
      shouldRejectRequest: shouldRejectLoad,
      errorMessage: 'Assistant settings could not be loaded',
    });
  };

  const handlers = [
    graphql.mutation('ResetAiChatAssistantProfile', async () => {
      const shouldRejectSave = shouldFailNextSave;
      shouldFailNextSave = false;
      resetProfile();
      const errorResponse = await getRequestErrorResponse({
        pendingRequest: pendingSave,
        shouldRejectRequest: shouldRejectSave,
        errorMessage: 'Assistant settings could not be reset',
      });

      if (isDefined(errorResponse)) {
        return errorResponse;
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
    load,
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
