import { styled } from '@linaria/react';
import { Card, CardContent } from 'twenty-ui/layout';
import { Toggle } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type Parameter = {
  value: boolean;
  title: string;
  description: string;
  onToggle: (value: boolean) => void;
};

type SettingsAccountsToggleSettingCardProps = {
  parameters: Parameter[];
};

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  cursor: pointer;

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledToggle = styled(Toggle)`
  margin-left: auto;
`;

export const SettingsAccountsToggleSettingCard = ({
  parameters,
}: SettingsAccountsToggleSettingCardProps) => (
  <Card rounded>
    {parameters.map((parameter, index) => (
      <StyledCardContent
        key={index}
        divider={index < parameters.length - 1}
        onClick={() => parameter.onToggle(!parameter.value)}
      >
        <div>
          <StyledTitle>{parameter.title}</StyledTitle>
          <StyledDescription>{parameter.description}</StyledDescription>
        </div>
        <StyledToggle value={parameter.value} onChange={parameter.onToggle} />
      </StyledCardContent>
    ))}
  </Card>
);
