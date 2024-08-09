import { MessageThreadSubscriber } from '@/activities/emails/types/MessageThreadSubscriber';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import {
  Avatar,
  AvatarGroup,
  Chip,
  ChipVariant,
  IconChevronDown,
  ThemeContext,
} from 'twenty-ui';

const MAX_NUMBER_OF_AVATARS = 3;

export const MessageThreadSubscribersChip = ({
  messageThreadSubscribers,
}: {
  messageThreadSubscribers: MessageThreadSubscriber[];
}) => {
  const { theme } = useContext(ThemeContext);

  const numberOfMessageThreadSubscribers = messageThreadSubscribers.length;

  const isOnlyOneSubscriber = numberOfMessageThreadSubscribers === 1;

  const isPrivateThread = isOnlyOneSubscriber;

  const privateLabel = 'Private';

  const susbcriberAvatarUrls = messageThreadSubscribers
    .map((member) => member.workspaceMember.avatarUrl)
    .filter(isNonEmptyString);

  const firstAvatarUrl = susbcriberAvatarUrls[0];
  const firstAvatarColorSeed = messageThreadSubscribers?.[0].workspaceMember.id;
  const firstAvatarPlaceholder =
    messageThreadSubscribers?.[0].workspaceMember.name.firstName;

  const subscriberNames = messageThreadSubscribers.map(
    (member) => member.workspaceMember?.name.firstName,
  );

  const moreAvatarsLabel =
    numberOfMessageThreadSubscribers > MAX_NUMBER_OF_AVATARS
      ? `+${numberOfMessageThreadSubscribers - MAX_NUMBER_OF_AVATARS}`
      : null;

  const label = isPrivateThread ? privateLabel : (moreAvatarsLabel ?? '');

  return (
    <Chip
      label={label}
      variant={ChipVariant.Highlighted}
      leftComponent={
        isOnlyOneSubscriber ? (
          <Avatar
            avatarUrl={firstAvatarUrl}
            placeholderColorSeed={firstAvatarColorSeed}
            placeholder={firstAvatarPlaceholder}
            size="md"
            type={'rounded'}
          />
        ) : (
          <AvatarGroup
            avatars={subscriberNames.map((name, index) => (
              <Avatar
                key={name}
                avatarUrl={susbcriberAvatarUrls[index] ?? ''}
                placeholder={name}
                type="rounded"
              />
            ))}
          />
        )
      }
      rightComponent={<IconChevronDown size={theme.icon.size.sm} />}
      clickable
    />
  );
};
