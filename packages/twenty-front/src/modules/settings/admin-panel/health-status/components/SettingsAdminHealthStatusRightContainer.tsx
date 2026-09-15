import { t } from '@lingui/core/macro';
import { Status } from 'twenty-ui/data-display';
import { AdminPanelHealthServiceStatus } from '~/generated-admin/graphql';

export const SettingsAdminHealthStatusRightContainer = ({
  status,
}: {
  status: AdminPanelHealthServiceStatus;
}) => {
  return (
    <>
      {status === AdminPanelHealthServiceStatus.OPERATIONAL && (
        <Status color="green" weight="medium">{t`Operational`}</Status>
      )}
      {status === AdminPanelHealthServiceStatus.OUTAGE && (
        <Status color="red" weight="medium">{t`Outage`}</Status>
      )}
    </>
  );
};
