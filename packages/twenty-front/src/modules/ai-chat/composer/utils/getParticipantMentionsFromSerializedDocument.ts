import { isNonEmptyString } from '@sniptt/guards';
import uniqBy from 'lodash.uniqby';

import { type AiChatParticipantMention } from '@/ai-chat/composer/types/AiChatParticipantMention';
import { getAiChatMentionNodes } from '@/ai-chat/composer/utils/getAiChatMentionNodes';
import { isAiChatParticipantMentionAttributes } from '@/ai-chat/composer/utils/isAiChatParticipantMentionAttributes';

export const getParticipantMentionsFromSerializedDocument = (
  serializedDocument: string,
): AiChatParticipantMention[] =>
  uniqBy(
    getAiChatMentionNodes(serializedDocument).flatMap(({ attrs }) => {
      const workspaceMemberId = attrs?.recordId;
      const label = attrs?.label;

      return isAiChatParticipantMentionAttributes(attrs) &&
        isNonEmptyString(workspaceMemberId)
        ? [{ workspaceMemberId, label: isNonEmptyString(label) ? label : '' }]
        : [];
    }),
    'workspaceMemberId',
  );
