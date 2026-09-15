import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBillingContentSkeleton = styled.div`
  background: linear-gradient(
    90deg,
    ${themeCssVariables.background.transparent.light} 0%,
    ${themeCssVariables.background.transparent.lighter} 100%
  );
  border-radius: ${themeCssVariables.border.radius.md} 0 0
    ${themeCssVariables.border.radius.md};
  height: ${themeCssVariables.spacing[6]};
  width: 160px;
`;

export const SettingsBillingContentSkeleton = () => (
  <SettingsPageContainer>
    <StyledBillingContentSkeleton />
  </SettingsPageContainer>
);
