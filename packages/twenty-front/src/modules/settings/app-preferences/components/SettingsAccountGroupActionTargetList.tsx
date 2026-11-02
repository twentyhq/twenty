import { type AccountGroupActionTarget } from '@/settings/app-preferences/types/AccountGroupActionTarget';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledList = styled.ul`
  margin: ${themeCssVariables.spacing[2]} 0 0;
  padding-left: ${themeCssVariables.spacing[4]};
`;

type SettingsAccountGroupActionTargetListProps = {
  targets: AccountGroupActionTarget[];
};

export const SettingsAccountGroupActionTargetList = ({
  targets,
}: SettingsAccountGroupActionTargetListProps) => {
  const labels = [...new Set(targets.map(({ label }) => label))];

  return (
    <StyledList>
      {labels.map((label) => (
        <li key={label}>{label}</li>
      ))}
    </StyledList>
  );
};
