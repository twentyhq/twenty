import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';
import { IconBuildingSkyscraper } from 'twenty-ui/icon';
import { MainButton } from 'twenty-ui/input';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { REACT_APP_SAAS_AUTH_REDIRECT_URL } from '~/config';

import { StyledSSOButtonContainer } from './SignInUpSSOButtonStyles';

export const SignInUpWithSaaS = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(REACT_APP_SAAS_AUTH_REDIRECT_URL, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Unable to start SmartBiz CRM login');
      }

      const data = (await response.json()) as { redirectUrl?: string };

      if (!data.redirectUrl) {
        throw new Error('SmartBiz CRM login did not return a redirect URL');
      }

      window.location.href = data.redirectUrl;
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StyledSSOButtonContainer>
        <MainButton
          Icon={() => <IconBuildingSkyscraper size={theme.icon.size.md} />}
          title={t`Continue with SmartBiz`}
          onClick={handleClick}
          variant="secondary"
          fullWidth
          disabled={isLoading}
        />
      </StyledSSOButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
