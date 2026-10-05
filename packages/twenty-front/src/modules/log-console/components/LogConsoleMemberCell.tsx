import { isDefined } from 'twenty-shared/utils';

import { LogConsoleMemberAvatar } from '@/log-console/components/LogConsoleMemberAvatar';
import { useLogConsoleMember } from '@/log-console/hooks/useLogConsoleMember';
import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { SettingsTableTextCell } from '@/settings/components/SettingsTableTextCell';

type LogConsoleMemberCellProps = {
  userId?: string | null;
  userWorkspaceId?: string | null;
  actor?: Partial<FieldActorValue>;
  isImpersonator?: boolean;
};

export const LogConsoleMemberCell = (props: LogConsoleMemberCellProps) => {
  const member = useLogConsoleMember(props);

  return (
    <SettingsTableTextCell
      startElement={
        isDefined(member) ? <LogConsoleMemberAvatar member={member} /> : null
      }
      text={member?.name}
    />
  );
};
