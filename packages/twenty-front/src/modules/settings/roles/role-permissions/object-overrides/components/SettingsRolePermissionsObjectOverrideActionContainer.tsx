import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledActionContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};
`;

export { StyledActionContainer as SettingsRolePermissionsObjectOverrideActionContainer };
