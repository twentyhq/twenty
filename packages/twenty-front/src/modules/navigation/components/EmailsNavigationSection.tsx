import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { AppPath, FeatureFlagKey } from 'twenty-shared/types';

import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

const StyledLink = styled(Link)`
  color: inherit;
  display: block;
  text-decoration: none;
  width: 100%;
`;

export const EmailsNavigationSection = () => {
  const isEmailGroupFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  if (!isEmailGroupFeatureEnabled) {
    return null;
  }

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <StyledLink to={AppPath.Emails}>
          <NavigationDrawerSectionTitle label="Emails" />
        </StyledLink>
      </NavigationDrawerAnimatedCollapseWrapper>
    </NavigationDrawerSection>
  );
};
