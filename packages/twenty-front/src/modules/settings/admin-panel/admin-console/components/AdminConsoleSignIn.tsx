import { useLingui } from '@lingui/react/macro';

import { SubTitle } from '@/auth/components/SubTitle';
import { OnboardingVerifyLayout } from '@/onboarding/components/OnboardingVerifyLayout';
import { AdminConsoleSignInEffect } from '@/settings/admin-panel/admin-console/components/AdminConsoleSignInEffect';

export const AdminConsoleSignIn = () => {
  const { t } = useLingui();

  return (
    <>
      <AdminConsoleSignInEffect />
      <OnboardingVerifyLayout>
        <SubTitle>{t`Opening the admin console`}</SubTitle>
      </OnboardingVerifyLayout>
    </>
  );
};
