import { useAuth } from '@/auth/hooks/useAuth';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconLogout } from 'twenty-ui/display';

export const InformationBannerIsImpersonating = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { signOut } = useAuth();

  if (!isDefined(currentWorkspaceMember)) {
    return null;
  }

  const impersonatedUser = `${currentWorkspaceMember.name.firstName} ${currentWorkspaceMember.name.lastName} (${currentWorkspaceMember.userEmail})`;

  return (
    <InformationBanner
      message={t`Logged in as ${impersonatedUser}`}
      buttonTitle={t`Stop impersonating`}
      buttonIcon={IconLogout}
      buttonOnClick={signOut}
    />
  );
};
