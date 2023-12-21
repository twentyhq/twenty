import styled from '@emotion/styled';

import { validateMetadataLabel } from '@/object-metadata/utils/validateMetadataLabel';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { Section } from '@/ui/layout/section/components/Section';

type SettingsObjectFormSectionProps = {
  disabled?: boolean;
  icon?: string;
  singularName?: string;
  pluralName?: string;
  description?: string;
  onChange?: (
    formValues: Partial<{
      icon: string;
      labelSingular: string;
      labelPlural: string;
      description: string;
    }>,
  ) => void;
};

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SettingsObjectFormSection = ({
  disabled,
  icon = 'IconPigMoney',
  singularName = '',
  pluralName = '',
  description = '',
  onChange,
}: SettingsObjectFormSectionProps) => (
  <Section>
    <H2Title
      title="About"
      description="Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms."
    />
    <StyledInputsContainer>
      <StyledInputContainer>
        <StyledLabel>Icon</StyledLabel>
        <IconPicker
          disabled={disabled}
          selectedIconKey={icon}
          onChange={(icon) => {
            onChange?.({ icon: icon.iconKey });
          }}
        />
      </StyledInputContainer>
      <TextInput
        label="Singular"
        placeholder="Investor"
        value={singularName}
        onChange={(value) => {
          if (!value || validateMetadataLabel(value)) {
            onChange?.({ labelSingular: value });
          }
        }}
        disabled={disabled}
        fullWidth
      />
      <TextInput
        label="Plural"
        placeholder="Investors"
        value={pluralName}
        onChange={(value) => {
          if (!value || validateMetadataLabel(value)) {
            onChange?.({ labelPlural: value });
          }
        }}
        disabled={disabled}
        fullWidth
      />
    </StyledInputsContainer>
    <TextArea
      placeholder="Write a description"
      minRows={4}
      value={description}
      onChange={(value) => onChange?.({ description: value })}
      disabled={disabled}
    />
  </Section>
);
