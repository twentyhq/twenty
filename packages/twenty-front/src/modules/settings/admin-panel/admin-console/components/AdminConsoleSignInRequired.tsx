import { StyledAuthContent } from '@/auth/components/StyledAuthContent';
import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
import { useLingui } from '@lingui/react/macro';
import { MainButton } from 'twenty-ui/components/input';

export const AdminConsoleSignInRequired = () => {
  const { t } = useLingui();
  const { redirectToDefaultDomain } = useRedirectToDefaultDomain();

  return (
    <StyledAuthContent>
      <Title>{t`Admin console`}</Title>
      <SubTitle>
        {t`Open the admin console from the Admin Panel of your workspace settings.`}
      </SubTitle>
      <MainButton
        title={t`Go to my workspace`}
        onClick={() => redirectToDefaultDomain()}
        fullWidth
      />
    </StyledAuthContent>
  );
};
