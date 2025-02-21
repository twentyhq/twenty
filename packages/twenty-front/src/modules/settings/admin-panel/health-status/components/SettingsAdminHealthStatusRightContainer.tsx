import { Status } from 'twenty-ui';
import { AdminPanelHealthServiceStatus } from '~/generated/graphql';

export const SettingsAdminHealthStatusRightContainer = ({
  status,
}: {
  status: AdminPanelHealthServiceStatus;
}) => {
  return (
    <>
      {status === AdminPanelHealthServiceStatus.OPERATIONAL && (
        <Status color="green" text="Operational" weight="medium" />
      )}
      {status === AdminPanelHealthServiceStatus.OUTAGE && (
        <Status color="red" text="Outage" weight="medium" />
      )}
    </>
  );
};
