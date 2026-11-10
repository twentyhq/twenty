import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCard = styled.section`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledCaption = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type CoreWorkflowOverviewStatCardProps = {
  label: string;
  value: string;
  caption: string;
};

export const CoreWorkflowOverviewStatCard = ({
  label,
  value,
  caption,
}: CoreWorkflowOverviewStatCardProps) => (
  <StyledCard aria-label={label}>
    <StyledLabel>{label}</StyledLabel>
    <StyledValue>{value}</StyledValue>
    <StyledCaption>{caption}</StyledCaption>
  </StyledCard>
);
