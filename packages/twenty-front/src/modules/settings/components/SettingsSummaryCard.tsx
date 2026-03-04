import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Card, CardContent } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsSummaryCardProps = {
  title: ReactNode;
  rightComponent: ReactNode;
};

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[6]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  margin-right: auto;
`;

export const SettingsSummaryCard = ({
  title,
  rightComponent,
}: SettingsSummaryCardProps) => (
  <Card>
    <StyledCardContent>
      <StyledTitle>{title}</StyledTitle>
      {rightComponent}
    </StyledCardContent>
  </Card>
);
