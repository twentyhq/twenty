import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { H2Title } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

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

type ApplicabilityOption<T> = {
  key: keyof T;
  label: string;
  description?: string;
};

type SettingsRoleApplicabilityProps<T> = {
  title?: string;
  description?: string;
  options: ApplicabilityOption<T>[];
  values: T;
  onApplicabilityChange: (key: keyof T, value: boolean) => void;
  isEditable: boolean;
};

export const SettingsRoleApplicability = <T extends Record<string, boolean>>({
  title = t`Applicability`,
  description = t`Control which types of entities this can be assigned to`,
  options,
  values,
  onApplicabilityChange,
  isEditable,
}: SettingsRoleApplicabilityProps<T>) => {
  return (
    <Section>
      <H2Title title={title} description={description} />
      <StyledCheckboxList>
        {options.map((option) => (
          <StyledCheckboxContainer key={String(option.key)}>
            <Checkbox
              checked={values[option.key] ?? true}
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
