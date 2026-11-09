import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

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

export const StyledSettingsBillingCardGridBody = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[6]};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const StyledSettingsBillingCardTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

export const StyledSettingsBillingCardTitleLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  white-space: nowrap;
`;

export const StyledSettingsBillingCardFieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

export const StyledSettingsBillingCardFieldListWithDivider = styled(
  StyledSettingsBillingCardFieldList,
)`
  border-left: 1px solid ${themeCssVariables.background.transparent.light};
  padding-left: ${themeCssVariables.spacing[6]};

  @media (max-width: 640px) {
    border-left: 0;
    border-top: 1px solid ${themeCssVariables.background.transparent.light};
    padding-left: 0;
    padding-top: ${themeCssVariables.spacing[4]};
  }
`;
