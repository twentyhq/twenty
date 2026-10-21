import { isNonEmptyString } from '@sniptt/guards';

import { AppChip } from '@/applications/components/AppChip';
import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { SettingsTableTextCell } from '@/settings/components/SettingsTableTextCell';

type LogConsoleAppCellProps = {
  applicationId?: string | null;
};

export const LogConsoleAppCell = ({
  applicationId,
}: LogConsoleAppCellProps) => {
  const { applicationChipData } = useApplicationChipData({ applicationId });

  return (
    <SettingsTableTextCell
      startElement={
        isNonEmptyString(applicationChipData.name) ? (
          <AppChip applicationId={applicationId} size="sm" chipOnly />
        ) : null
      }
      text={applicationChipData.name}
    />
  );
};
