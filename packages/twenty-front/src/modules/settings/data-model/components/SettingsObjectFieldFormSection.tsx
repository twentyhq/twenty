import styled from '@emotion/styled';

import { validateMetadataLabel } from '@/object-metadata/utils/validateMetadataLabel';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { Section } from '@/ui/layout/section/components/Section';

type SettingsObjectFieldFormSectionProps = {
  disabled?: boolean;
  disableNameEdition?: boolean;
  name?: string;
  label?: string;
  description?: string;
  iconKey?: string;
  onChange?: (
    formValues: Partial<{
      icon: string;
      label: string;
      name: string;
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
  disableNameEdition,
  name = '',
  label = '',
  description = '',
  iconKey = 'IconUsers',
  onChange,
}: SettingsObjectFieldFormSectionProps) => {
  const { translate } = useI18n('translations');

  return (
    <Section>
      <H2Title
        title={translate('nameAndDescription')}
        description={translate('nameAndDescriptionDsc')}
      />
      <StyledInputsContainer>
        <IconPicker
          disabled={disabled}
          selectedIconKey={iconKey}
          onChange={(value) => onChange?.({ icon: value.iconKey })}
          variant="primary"
        />
        <TextInput
          placeholder={'employees'}
          value={name}
          onChange={(value) => {
            if (!value || validateMetadataLabel(value)) {
              onChange?.({ name: value });
            }
          }}
          disabled={disabled || disableNameEdition}
          fullWidth
        />
        <TextInput
          placeholder={translate('employees')}
          value={label}
          onChange={(value) => onChange?.({ label: value })}
          disabled={disabled}
          fullWidth
        />
      </StyledInputsContainer>
      <TextArea
        placeholder={translate('writeDescription')}
        minRows={4}
        value={description}
        onChange={(value) => onChange?.({ description: value })}
        disabled={disabled}
      />
    </Section>
  );
};
