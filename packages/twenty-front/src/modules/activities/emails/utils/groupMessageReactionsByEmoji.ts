import { isNonEmptyString } from '@sniptt/guards';
import { isFieldValueRestricted } from 'twenty-shared/utils';

import { type MessageReaction } from '@/activities/emails/types/MessageReaction';

export type MessageReactionGroup = {
  emoji: string;
  reactorNames: string[];
};

export const groupMessageReactionsByEmoji = ({
  reactions,
  displayNameByHandle,
}: {
  reactions: MessageReaction[];
  displayNameByHandle: ReadonlyMap<string, string>;
}): MessageReactionGroup[] => {
  const reactorNamesByEmoji = new Map<string, string[]>();

  for (const { emoji, handle, displayName } of reactions) {
    if (!isNonEmptyString(emoji) || isFieldValueRestricted(emoji)) {
      continue;
    }

    const participantName = isNonEmptyString(handle)
      ? displayNameByHandle.get(handle)
      : undefined;
    const reactorName =
      [participantName, displayName, handle].find(isNonEmptyString) ?? '';

    reactorNamesByEmoji.set(emoji, [
      ...(reactorNamesByEmoji.get(emoji) ?? []),
      reactorName,
    ]);
  }

  return [...reactorNamesByEmoji].map(([emoji, reactorNames]) => ({
    emoji,
    reactorNames,
  }));
};
