import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { H2Title, IconKey, IconRobot, IconUsers } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledCheckboxContainer = styled.div<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: background-color
    ${({ theme }) => theme.animation.duration.normal}s ease;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledCheckboxLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
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
  const theme = useTheme();

  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

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
    ...(isAiEnabled
      ? [
          {
            key: 'canBeAssignedToApiKeys' as const,
            label: t`Assignable to API Keys`,
            Icon: IconKey,
          },
        ]
      : []),
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
