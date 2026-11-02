import { useLingui } from '@lingui/react/macro';
import { Status } from 'twenty-ui/primitives/data-display';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type SettingsSyncFailedStatusProps = {
  reason?: string;
};

export const SettingsSyncFailedStatus = ({
  reason,
}: SettingsSyncFailedStatusProps) => {
  const { t } = useLingui();

  return (
    <Tooltip content={reason}>
      <Status color="red" weight="medium">{t`Sync failed`}</Status>
    </Tooltip>
  );
};
