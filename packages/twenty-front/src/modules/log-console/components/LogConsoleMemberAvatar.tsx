import { isNonEmptyString } from '@sniptt/guards';
import { IconLifebuoy } from 'twenty-ui/icon';

import { type LogConsoleMember } from '@/log-console/types/LogConsoleMember';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { getActorSourceIcon } from '@/ui/field/display/utils/getActorSourceIcon';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type LogConsoleMemberAvatarProps = {
  member: LogConsoleMember;
};

export const LogConsoleMemberAvatar = ({
  member,
}: LogConsoleMemberAvatarProps) => (
  <AvatarOrIcon
    colorSeed={member.workspaceMemberId ?? undefined}
    shape={isNonEmptyString(member.workspaceMemberId) ? 'circle' : 'square'}
    name={member.name}
    Icon={
      member.isSupportTeam
        ? IconLifebuoy
        : getActorSourceIcon({ source: member.source, context: member.context })
    }
    src={getAbsoluteImageUrl(member.avatarUrl ?? undefined)}
  />
);
