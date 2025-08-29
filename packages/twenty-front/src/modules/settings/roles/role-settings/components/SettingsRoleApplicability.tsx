import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { H2Title } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { type Role } from '~/generated/graphql';

const StyledCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledCheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

type SettingsRoleApplicabilityProps = {
  onApplicabilityChange: (
    key:
      | 'canBeAssignedToUsers'
      | 'canBeAssignedToAgents'
      | 'canBeAssignedToApiKeys',
    value: boolean,
  ) => void;
  isEditable: boolean;
  role: Role;
};

const APPLICABILITY_OPTIONS = [
  {
    key: 'canBeAssignedToUsers' as const,
    label: t`Assignable to team members`,
  },
  {
    key: 'canBeAssignedToAgents' as const,
    label: t`Assignable to automation agents`,
  },
  {
    key: 'canBeAssignedToApiKeys' as const,
    label: t`Assignable to API integrations`,
  },
];

export const SettingsRoleApplicability = ({
  role,
  onApplicabilityChange,
  isEditable,
}: SettingsRoleApplicabilityProps) => {
  return (
    <Section>
      <H2Title
        title={t`Applicability`}
        description={t`Control which types of entities this role can be assigned to`}
      />
      <StyledCheckboxList>
        {APPLICABILITY_OPTIONS.map((option) => (
          <StyledCheckboxContainer key={option.key}>
            <Checkbox
              checked={role[option.key] ?? true}
              onChange={(event) => {
                onApplicabilityChange(option.key, event.target.checked);
              }}
              disabled={!isEditable}
            />
            <span>{option.label}</span>
          </StyledCheckboxContainer>
        ))}
      </StyledCheckboxList>
    </Section>
  );
};
