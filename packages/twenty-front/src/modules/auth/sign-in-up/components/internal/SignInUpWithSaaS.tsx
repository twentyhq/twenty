import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';
import { IconBuildingSkyscraper } from 'twenty-ui/icon';
import { MainButton } from 'twenty-ui/input';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { REACT_APP_SMARTBIZ_CRM_URL } from '~/config';

import { StyledSSOButtonContainer } from './SignInUpSSOButtonStyles';

export const SignInUpWithSaaS = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    window.location.href = REACT_APP_SMARTBIZ_CRM_URL;
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
