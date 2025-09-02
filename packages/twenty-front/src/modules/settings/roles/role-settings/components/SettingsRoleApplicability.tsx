import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { H2Title, IconKey, IconRobot, IconUsers } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: background-color
    ${({ theme }) => theme.animation.duration.normal}s ease;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledCheckboxLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type SettingsRoleApplicabilityProps<T> = {
  values: T;
  onApplicabilityChange: (key: keyof T, value: boolean) => void;
  isEditable: boolean;
};

export const SettingsRoleApplicability = <T extends Record<string, boolean>>({
  values,
  onApplicabilityChange,
  isEditable,
}: SettingsRoleApplicabilityProps<T>) => {
  const theme = useTheme();

  const options = [
    {
      key: 'canBeAssignedToUsers',
      label: t`Assignable to team members`,
      Icon: IconUsers,
    },
    {
      key: 'canBeAssignedToAgents',
      label: t`Assignable to Agents`,
      Icon: IconRobot,
    },
    {
      key: 'canBeAssignedToApiKeys',
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
            key={option.key}
            onClick={() =>
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
