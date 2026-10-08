import { UntitledChipLabel } from '@/ui/field/display/components/UntitledChipLabel';
import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';

import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { getActorSourceIcon } from '@/ui/field/display/utils/getActorSourceIcon';
import { isNonEmptyString } from '@sniptt/guards';
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
      variant="ghost"
      startElement={
        <AvatarOrIcon
          colorSeed={workspaceMemberId ?? undefined}
          shape={workspaceMemberId ? 'circle' : 'square'}
          name={name}
          Icon={LeftIcon}
          src={getAbsoluteImageUrl(avatarUrl ?? undefined)}
        />
      }
      style={{ paddingInlineStart: 0 }}
    >
      {isNonEmptyString(name) ? name : <UntitledChipLabel />}
    </Chip>
  );
};
