import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { Button } from 'twenty-ui/primitives/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const GettingStartedInviteDoneAction = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  return (
    <Button
      onClick={() => navigateSettings(SettingsPath.WorkspaceMembersPage)}
    >{t`Invite in settings`}</Button>
  );
};
