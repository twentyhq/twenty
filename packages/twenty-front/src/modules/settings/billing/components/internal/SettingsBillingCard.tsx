import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledSettingsBillingCard = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
`;

export const StyledSettingsBillingCardHeader = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid ${themeCssVariables.background.transparent.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
`;
