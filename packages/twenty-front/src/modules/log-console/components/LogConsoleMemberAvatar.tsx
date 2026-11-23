import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconLifebuoy } from 'twenty-ui/icon';

import { ActorAppChip } from '@/applications/components/ActorAppChip';
import { type LogConsoleMember } from '@/log-console/types/LogConsoleMember';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { getActorSourceIcon } from '@/ui/field/display/utils/getActorSourceIcon';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type LogConsoleMemberAvatarProps = {
  member: LogConsoleMember;
};

export const LogConsoleMemberAvatar = ({
  member,
}: LogConsoleMemberAvatarProps) => {
  if (
    member.source === 'APPLICATION' &&
    isDefined(member.context?.applicationId)
  ) {
    return (
      <ActorAppChip
        applicationId={member.context.applicationId}
        name={member.name}
      />
    );
  }

  return (
    <AvatarOrIcon
      colorSeed={member.workspaceMemberId ?? undefined}
      shape={isNonEmptyString(member.workspaceMemberId) ? 'circle' : 'square'}
      name={member.name}
      Icon={
        member.isSupportTeam
          ? IconLifebuoy
          : getActorSourceIcon({
              source: member.source,
              context: member.context,
            })
      }
      src={getAbsoluteImageUrl(member.avatarUrl ?? undefined)}
    />
  );
};
