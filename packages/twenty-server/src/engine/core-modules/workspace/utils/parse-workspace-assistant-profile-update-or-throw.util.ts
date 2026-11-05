import { msg } from '@lingui/core/macro';
import { isBoolean, isUndefined } from '@sniptt/guards';
import {
  AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH,
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
  getAiChatAssistantProfileSchema,
} from 'twenty-shared/ai';
import { doNotTranslate } from 'twenty-shared/i18n';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const parseWorkspaceAssistantProfileUpdateOrThrow = ({
  profile,
  reset,
}: {
  profile: unknown;
  reset: unknown;
}) => {
  if (!isUndefined(reset) && !isBoolean(reset)) {
    throw new UserInputError(
      doNotTranslate('Invalid assistant profile reset'),
      {
        userFriendlyMessage: msg`Choose whether to reset the assistant profile.`,
      },
    );
  }

  if (reset === true && !isUndefined(profile)) {
    throw new UserInputError(
      doNotTranslate('Cannot reset and edit the assistant profile together'),
      {
        userFriendlyMessage: msg`Reset the assistant profile separately from other profile edits.`,
      },
    );
  }

  if (reset === true) {
    return {
      profile: DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
      shouldReplaceProfile: true,
    };
  }

  if (isUndefined(profile)) {
    return undefined;
  }

  const result = getAiChatAssistantProfileSchema()
    .partial()
    .strict()
    .safeParse(profile);

  if (!result.success) {
    throw new UserInputError(doNotTranslate('Invalid assistant profile'), {
      userFriendlyMessage: msg`Enter a name between 1 and ${AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH} characters and supported assistant appearance options.`,
    });
  }

  return { profile: result.data, shouldReplaceProfile: false };
};
