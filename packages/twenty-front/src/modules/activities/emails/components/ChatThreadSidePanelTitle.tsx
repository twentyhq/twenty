import { isNonEmptyString, isNull } from '@sniptt/guards';
import { AvatarGroup } from 'twenty-ui/components/data-display';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { useChatThreadCounterparts } from '@/activities/emails/hooks/useChatThreadCounterparts';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { getEmailParticipantAvatarColorSeed } from '@/activities/emails/utils/getEmailParticipantAvatarColorSeed';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const MAX_VISIBLE_COUNTERPART_AVATARS = 3;

type ChatThreadSidePanelTitleProps = {
  messageThreadId: string;
};

export const ChatThreadSidePanelTitle = ({
  messageThreadId,
}: ChatThreadSidePanelTitleProps) => {
  const { messages } = useEmailThread(messageThreadId);
  const counterparts = useChatThreadCounterparts(messages);

  if (isNull(counterparts)) {
    return null;
  }

  const title = counterparts
    .map(({ displayName }) => displayName)
    .filter(isNonEmptyString)
    .join(', ');

  return (
    <HeaderIdentifier
      icon={
        <AvatarGroup
          maxVisible={MAX_VISIBLE_COUNTERPART_AVATARS}
          overlapOffset={themeCssVariables.spacing[1]}
          overflowShape="circle"
          avatars={counterparts.map((counterpart) => (
            <Avatar
              key={counterpart.handle}
              src={getAbsoluteImageUrl(
                counterpart.person?.avatarUrl ??
                  counterpart.workspaceMember?.avatarUrl,
              )}
              colorSeed={getEmailParticipantAvatarColorSeed(counterpart)}
              name={counterpart.displayName}
              size="md"
              shape="circle"
              ring
            />
          ))}
        />
      }
      title={title}
    />
  );
};
