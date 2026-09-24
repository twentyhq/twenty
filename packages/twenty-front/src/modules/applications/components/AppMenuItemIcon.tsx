import { AppChip } from '@/applications/components/AppChip';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAppIconContainer = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  padding: ${themeCssVariables.spacing[1]};
`;

type AppMenuItemIconProps = {
  applicationId?: string | null;
};

export const AppMenuItemIcon = ({ applicationId }: AppMenuItemIconProps) => (
  <StyledAppIconContainer>
    <AppChip applicationId={applicationId} size="md" chipOnly />
  </StyledAppIconContainer>
);
