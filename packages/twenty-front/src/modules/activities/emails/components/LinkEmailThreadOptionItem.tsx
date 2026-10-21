import { getEmailParticipantAvatarColorSeed } from '@/activities/emails/utils/getEmailParticipantAvatarColorSeed';
import { getTimelineThreadLabel } from '@/activities/emails/utils/getTimelineThreadLabel';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { type TimelineThread } from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type LinkEmailThreadOptionItemProps = {
  thread: TimelineThread;
  isLinked: boolean;
  disabled: boolean;
  onToggle: (messageThreadId: string) => void;
};

export const LinkEmailThreadOptionItem = ({
  thread,
  isLinked,
  disabled,
  onToggle,
}: LinkEmailThreadOptionItemProps) => (
  <Dropdown.OptionItem
    value={thread.id}
    selected={isLinked}
    indicator="checkbox"
    disabled={disabled}
    startIcon={
      <Avatar
        src={getAbsoluteImageUrl(thread.firstParticipant.avatarUrl)}
        name={thread.firstParticipant.displayName}
        colorSeed={getEmailParticipantAvatarColorSeed(thread.firstParticipant)}
        shape="circle"
        size="sm"
      />
    }
    description={formatToHumanReadableDate(thread.lastMessageReceivedAt)}
    onSelect={() => onToggle(thread.id)}
  >
    {getTimelineThreadLabel(thread)}
  </Dropdown.OptionItem>
);
