import { msg } from '@lingui/core/macro';
import {
  AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH,
  getAiChatAssistantProfileSchema,
} from 'twenty-shared/ai';
import { doNotTranslate } from 'twenty-shared/i18n';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const parseWorkspaceAssistantProfilePatchOrThrow = (
  profile: unknown,
) => {
  const result = getAiChatAssistantProfileSchema()
    .partial()
    .strict()
    .safeParse(profile);

  if (!result.success) {
    throw new UserInputError(doNotTranslate('Invalid assistant profile'), {
      userFriendlyMessage: msg`Enter a name between 1 and ${AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH} characters and supported assistant appearance options.`,
    });
  }

  return result.data;
};
