import { Status } from 'twenty-ui/primitives/data-display';
import { AdminPanelHealthServiceStatus } from '~/generated-admin/graphql';
import { useLingui } from '@lingui/react/macro';

export const SettingsAdminHealthStatusRightContainer = ({
  status,
}: {
  status: AdminPanelHealthServiceStatus;
}) => {
  const { t } = useLingui();
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
