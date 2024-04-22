import styled from '@emotion/styled';

import { validateMetadataLabel } from '@/object-metadata/utils/validateMetadataLabel';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { Section } from '@/ui/layout/section/components/Section';

type SettingsObjectFieldFormSectionProps = {
  disabled?: boolean;
  name?: string;
  description?: string;
  iconKey?: string;
  onChange?: (
    formValues: Partial<{
      icon: string;
      label: string;
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

export const SettingsObjectFieldFormSection = ({
  disabled,
  name = '',
  description = '',
  iconKey = 'IconUsers',
  onChange,
}: SettingsObjectFieldFormSectionProps) => (
  <Section>
    <H2Title
      title="Name and description"
      description="The name and description of this field"
    />
    <StyledInputsContainer>
      <IconPicker
        disabled={disabled}
        selectedIconKey={iconKey}
        onChange={(value) => onChange?.({ icon: value.iconKey })}
        variant="primary"
      />
      <TextInput
        placeholder="Employees"
        value={name}
        onChange={(value) => {
          if (!value || validateMetadataLabel(value)) {
            onChange?.({ label: value });
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
