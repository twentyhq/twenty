import { useLingui } from '@lingui/react/macro';

import { SettingsDeviceSessionRowDropdownMenu } from '@/settings/profile/devices/components/SettingsDeviceSessionRowDropdownMenu';
import { Status } from 'twenty-ui/data-display';
import { type CurrentUserSessionsQuery } from '~/generated-metadata/graphql';

type UserSessionListItem =
  CurrentUserSessionsQuery['currentUserSessions'][number];

export const SettingsDeviceSessionRowRightComponent = ({
  item: session,
}: {
  item: UserSessionListItem;
}) => {
  const { t } = useLingui();

  return (
    <>
      {session.isImpersonating && (
        <Status color="orange">{t`Impersonation`}</Status>
      )}
      {session.isCurrent ? (
        <Status color="turquoise">{t`This device`}</Status>
      ) : (
        <SettingsDeviceSessionRowDropdownMenu userSessionId={session.id} />
      )}
    </>
  );
};
