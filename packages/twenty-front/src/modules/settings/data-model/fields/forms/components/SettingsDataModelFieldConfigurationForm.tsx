import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FIELD_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/FieldNameMaximumLength';
import { SettingsDataModelFieldDescriptionForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldDescriptionForm';
import { SettingsDataModelFieldIconLabelForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';
import { SettingsDataModelFieldSettingsFormCard } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldSettingsFormCard';
import { SettingsDataModelHotkeyScope } from '@/settings/data-model/types/SettingsDataModelHotKeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { Section } from '@react-email/components';
import { UseFormReturn } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { H2Title } from 'twenty-ui';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';
import { SettingsDataModelNewFieldFormValues } from '~/pages/settings/data-model/SettingsObjectNewField/SettingsObjectNewFieldStep2';

type SettingsDataModelFieldConfigurationFormProps = {
  formConfig: UseFormReturn<SettingsDataModelNewFieldFormValues>;
  activeObjectMetadataItem: ObjectMetadataItem;
  setIsConfigureStep: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SettingsDataModelFieldConfigurationForm = ({
  formConfig,
  activeObjectMetadataItem,
  setIsConfigureStep,
}: SettingsDataModelFieldConfigurationFormProps) => {
  useHotkeyScopeOnMount(
    SettingsDataModelHotkeyScope.SettingsDataModelFieldConfigurationForm,
  );

  useScopedHotkeys(
    Key.Escape,
    () => setIsConfigureStep(false),
    SettingsDataModelHotkeyScope.SettingsDataModelFieldConfigurationForm,
  );

  return (
    <>
      <Section>
        <H2Title
          title="Icon and Name"
          description="The name and icon of this field"
        />
        <SettingsDataModelFieldIconLabelForm
          maxLength={FIELD_NAME_MAXIMUM_LENGTH}
        />
      </Section>
      <Section>
        <H2Title title="Values" description="The values of this field" />
        <SettingsDataModelFieldSettingsFormCard
          fieldMetadataItem={{
            icon: formConfig.watch('icon'),
            label: formConfig.watch('label') || 'Employees',
            type: formConfig.watch('type'),
          }}
          objectMetadataItem={activeObjectMetadataItem}
        />
      </Section>
      <Section>
        <H2Title
          title="Description"
          description="The description of this field"
        />
        <SettingsDataModelFieldDescriptionForm />
      </Section>
    </>
  );
};
