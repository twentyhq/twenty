import styled from '@emotion/styled';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { AutosizeTextInput } from '@/ui/input/components/AutosizeTextInput';
import { TextInput } from '@/ui/input/components/TextInput';
import { Section } from '@/ui/layout/section/components/Section';

type SettingsObjectFormSectionProps = {
  singularName?: string;
  pluralName?: string;
  description?: string;
};

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTextInput = styled(TextInput)`
  flex: 1 0 auto;
`;

export const SettingsObjectFormSection = ({
  singularName,
  pluralName,
  description,
}: SettingsObjectFormSectionProps) => (
  <Section>
    <H2Title
      title="Name and description"
      description="Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms."
    />
    <StyledInputsContainer>
      <StyledTextInput
        label="Singular"
        placeholder="Invoice"
        value={singularName}
      />
      <StyledTextInput
        label="Plural"
        placeholder="Invoices"
        value={pluralName}
      />
    </StyledInputsContainer>
    <AutosizeTextInput
      placeholder="Write a description"
      minRows={4}
      value={description}
    />
  </Section>
);
