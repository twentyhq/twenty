import { useLingui } from '@lingui/react/macro';
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
  const { t } = useLingui();
  const member = useLogConsoleMember(props);

  if (!isDefined(member)) {
    return null;
  }

  return (
    <Chip
      emptyLabel={t`Untitled`}
      variant="ghost"
      startElement={<LogConsoleMemberAvatar member={member} />}
      style={{ paddingInlineStart: 0 }}
    >
      {member.name ?? ''}
    </Chip>
  );
};
