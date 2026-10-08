import { UntitledChipLabel } from '@/ui/field/display/components/UntitledChipLabel';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Chip } from 'twenty-ui/primitives/data-display';

import { LogConsoleMemberAvatar } from '@/log-console/components/LogConsoleMemberAvatar';
import { useLogConsoleMember } from '@/log-console/hooks/useLogConsoleMember';
import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';

type LogConsoleMemberChipProps = {
  userId?: string | null;
  userWorkspaceId?: string | null;
  actor?: Partial<FieldActorValue>;
  isImpersonator?: boolean;
};

export const LogConsoleMemberChip = (props: LogConsoleMemberChipProps) => {
  const member = useLogConsoleMember(props);

  if (!isDefined(member)) {
    return null;
  }

  return (
    <Chip
      variant="ghost"
      startElement={<LogConsoleMemberAvatar member={member} />}
      style={{ paddingInlineStart: 0 }}
    >
      {isNonEmptyString(member.name) ? member.name : <UntitledChipLabel />}
    </Chip>
  );
};
