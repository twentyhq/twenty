import styled from '@emotion/styled';

import { validateMetadataLabel } from '@/object-metadata/utils/validateMetadataLabel';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { Section } from '@/ui/layout/section/components/Section';

type SettingsObjectFormSectionProps = {
  disabled?: boolean;
  singularName?: string;
  pluralName?: string;
  description?: string;
  onChange?: (
    formValues: Partial<{
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

export const SettingsObjectFormSection = ({
  disabled,
  singularName = '',
  pluralName = '',
  description = '',
  onChange,
}: SettingsObjectFormSectionProps) => (
  <Section>
    <H2Title
      title="Name and description"
      description="Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms."
    />
    <StyledInputsContainer>
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
