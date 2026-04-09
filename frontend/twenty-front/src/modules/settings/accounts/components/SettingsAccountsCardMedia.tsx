import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCardMedia = styled.div`
  align-items: center;
  border: 2px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  height: ${themeCssVariables.spacing[8]};
  justify-content: center;
  padding: ${themeCssVariables.spacing['0.5']};
  width: ${themeCssVariables.spacing[6]};
`;

export { StyledCardMedia as SettingsAccountsCardMedia };
