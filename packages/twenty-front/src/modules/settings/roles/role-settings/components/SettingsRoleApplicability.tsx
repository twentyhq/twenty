import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { H2Title, IconKey, IconRobot, IconUsers } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCheckboxContainer = styled.div<{ disabled: boolean }>`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[1]};
  transition: background-color
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledCheckboxLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type SettingsRoleApplicabilityValues = {
  canBeAssignedToUsers: boolean;
  canBeAssignedToAgents: boolean;
  canBeAssignedToApiKeys: boolean;
};

type SettingsRoleApplicabilityProps = {
  values: SettingsRoleApplicabilityValues;
  onApplicabilityChange: (
    key: keyof SettingsRoleApplicabilityValues,
    value: boolean,
  ) => void;
  isEditable: boolean;
};

export const SettingsRoleApplicability = ({
  values,
  onApplicabilityChange,
  isEditable,
}: SettingsRoleApplicabilityProps) => {
  const { theme } = useContext(ThemeContext);

  const options = [
    {
      key: 'canBeAssignedToUsers' as const,
      label: t`Assignable to Workspace Members`,
      Icon: IconUsers,
    },
    {
      key: 'canBeAssignedToAgents' as const,
      label: t`Assignable to Agents`,
      Icon: IconRobot,
    },
    {
      key: 'canBeAssignedToApiKeys' as const,
      label: t`Assignable to API Keys`,
      Icon: IconKey,
    },
  ];
  return (
    <Section>
      <H2Title
        title={t`Applicability`}
        description={t`Control which types of entities this role can be assigned to`}
      />
      <div>
        {options.map((option) => (
          <StyledCheckboxContainer
            disabled={!isEditable}
            key={option.key}
            onClick={() =>
              isEditable &&
              onApplicabilityChange(option.key, !values[option.key])
            }
          >
            <StyledCheckboxLabel>
              <option.Icon size={theme.icon.size.sm} />
              <span>{option.label}</span>
            </StyledCheckboxLabel>
            <Checkbox
              checked={values[option.key]}
              onChange={(event) => {
                event.stopPropagation();
                onApplicabilityChange(option.key, event.target.checked);
              }}
              disabled={!isEditable}
            />
          </StyledCheckboxContainer>
        ))}
      </div>
    </Section>
  );
};
