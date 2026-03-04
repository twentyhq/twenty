import { useAuth } from '@/auth/hooks/useAuth';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isImpersonatingState } from '@/auth/states/isImpersonatingState';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { t } from '@lingui/core/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { IconLogout } from 'twenty-ui/display';

export const InformationBannerIsImpersonating = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const isImpersonating = useAtomStateValue(isImpersonatingState);

  const { signOut } = useAuth();

  if (!isDefined(currentWorkspaceMember) || !isImpersonating) {
    return null;
  }

  const impersonatedUser = `${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName} (${currentWorkspaceMember.userEmail})`;

  return (
    <InformationBanner
      componentInstanceId="information-banner-is-impersonating"
      message={t`Logged in as ${impersonatedUser}`}
      buttonTitle={t`Stop impersonating`}
      buttonIcon={IconLogout}
      buttonOnClick={signOut}
    />
  );
};
