import styled from '@emotion/styled';

import { validateMetadataLabel } from '@/object-metadata/utils/validateMetadataLabel';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { Section } from '@/ui/layout/section/components/Section';

type SettingsObjectFormSectionProps = {
  disabled?: boolean;
  icon?: string;
  singularName?: string;
  pluralName?: string;
  singularLabel?: string;
  pluralLabel?: string;
  description?: string;
  onChange?: (
    formValues: Partial<{
      icon: string;
      labelSingular: string;
      nameSingular: string;
      labelPlural: string;
      namePlural: string;
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
  icon = 'IconListNumbers',
  singularName = '',
  pluralName = '',
  singularLabel = '',
  pluralLabel = '',
  description = '',
  onChange,
}: SettingsObjectFormSectionProps) => {
  const { translate } = useI18n('translations');
  return (
    <Section>
      <H2Title title={translate('about')} description={translate('aboutDsc')} />
      <StyledInputsContainer>
        <StyledInputContainer>
          <StyledLabel>{translate('icon')}</StyledLabel>
          <IconPicker
            disabled={disabled}
            selectedIconKey={icon}
            onChange={(icon) => {
              onChange?.({ icon: icon.iconKey });
            }}
          />
        </StyledInputContainer>
      </StyledInputsContainer>
      <StyledInputsContainer>
        <TextInput
          label={translate('nameSingularEn')}
          placeholder={'Listing'}
          value={singularName}
          onChange={(value) => {
            if (!value || validateMetadataLabel(value)) {
              onChange?.({ nameSingular: value });
            }
          }}
          disabled={disabled}
          fullWidth
        />
        <TextInput
          label={translate('titleSingular')}
          placeholder={translate('titleThatIsDisplayed')}
          value={singularLabel}
          onChange={(value) => onChange?.({ labelSingular: value })}
          disabled={disabled}
          fullWidth
        />
      </StyledInputsContainer>
      <StyledInputsContainer>
        <TextInput
          label={translate('namePluralEn')}
          placeholder={'investors'}
          value={pluralName}
          onChange={(value) => {
            if (!value || validateMetadataLabel(value)) {
              onChange?.({ namePlural: value });
            }
          }}
          disabled={disabled}
          fullWidth
        />
        <TextInput
          label={translate('titlePlural')}
          placeholder={translate('titleThatIsDisplayed')}
          value={pluralLabel}
          onChange={(value) => onChange?.({ labelPlural: value })}
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
