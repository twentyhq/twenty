import { AppChip } from '@/applications/components/AppChip';
import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';

import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { getActorSourceIcon } from '@/ui/field/display/utils/getActorSourceIcon';
import { isDefined } from 'twenty-shared/utils';
import { Chip } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type ActorDisplayProps = Partial<FieldActorValue> & {
  avatarUrl?: string | null;
};

export const ActorDisplay = ({
  name,
  source,
  workspaceMemberId,
  avatarUrl,
  context,
}: ActorDisplayProps) => {
  const LeftIcon = getActorSourceIcon({ source, context });

  return (
    <Chip
      variant="plain"
      startElement={
        source === 'APPLICATION' && isDefined(context?.applicationId) ? (
          <AppChip
            applicationId={context.applicationId}
            fallbackApplicationData={{ name }}
            size="sm"
            chipOnly
          />
        ) : (
          <AvatarOrIcon
            colorSeed={workspaceMemberId ?? undefined}
            shape={workspaceMemberId ? 'circle' : 'square'}
            name={name}
            Icon={LeftIcon}
            src={getAbsoluteImageUrl(avatarUrl ?? undefined)}
          />
        )
      }
    >
      {getChipLabel(name).content}
    </Chip>
  );
};
