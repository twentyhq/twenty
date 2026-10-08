import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

const AI_CHAT_INBOX_COMMAND_ICON_CHANGES = [
  {
    universalIdentifier: 'be18e927-4873-496d-bc12-b767b995653f',
    previousIcon: 'IconProgressCheck',
    nextIcon: 'IconCheck',
  },
  {
    universalIdentifier: '0fdab734-1e64-498d-8d3b-606e7f64d224',
    previousIcon: 'IconClockOff',
    nextIcon: 'IconZzzOff',
  },
  {
    universalIdentifier: '9fbb747d-2e09-4822-a1e5-6792d0a28fb7',
    previousIcon: 'IconClock',
    nextIcon: 'IconZzz',
  },
] as const;

export const buildAiChatInboxCommandIconUpdates = ({
  flatCommandMenuItemByUniversalIdentifier,
  direction,
  now,
}: {
  flatCommandMenuItemByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
  direction: 'up' | 'down';
  now: string;
}): FlatCommandMenuItem[] =>
  AI_CHAT_INBOX_COMMAND_ICON_CHANGES.flatMap(
    ({ universalIdentifier, previousIcon, nextIcon }) => {
      const existingCommandMenuItem =
        flatCommandMenuItemByUniversalIdentifier[universalIdentifier];
      const [fromIcon, toIcon] =
        direction === 'up'
          ? [previousIcon, nextIcon]
          : [nextIcon, previousIcon];

      if (
        !isDefined(existingCommandMenuItem) ||
        existingCommandMenuItem.icon !== fromIcon
      ) {
        return [];
      }

      return [{ ...existingCommandMenuItem, icon: toIcon, updatedAt: now }];
    },
  );
