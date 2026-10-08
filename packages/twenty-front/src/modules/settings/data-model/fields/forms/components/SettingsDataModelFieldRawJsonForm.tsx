import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { type SettingsDataModelFieldRawJsonFormValues } from '@/settings/data-model/fields/forms/utils/settingsDataModelFieldRawJsonSchema';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { Controller, useFormContext } from 'react-hook-form';
import { type FieldMetadataRawJsonSettings } from 'twenty-shared/types';
import { IconClick } from 'twenty-ui/icon';
import { Switch } from 'twenty-ui/primitives/input';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type SettingsDataModelFieldRawJsonFormProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
};

export const SettingsDataModelFieldRawJsonForm = ({
  disabled,
  existingFieldMetadataId,
}: SettingsDataModelFieldRawJsonFormProps) => {
  const { t } = useLingui();
  const { control } = useFormContext<SettingsDataModelFieldRawJsonFormValues>();
  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );
  const isOnDemandFieldsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_ON_DEMAND_FIELDS_ENABLED,
  );

  if (!isOnDemandFieldsEnabled) {
    return null;
  }

  const existingSettings: FieldMetadataRawJsonSettings =
    fieldMetadataItem?.settings ?? {};

  return (
    <Controller
      name="settings"
      control={control}
      defaultValue={existingSettings}
      render={({ field: { value, onChange } }) => (
        <SettingsOptionCardContentSelect
          Icon={IconClick}
          title={t`Load value when opened`}
          description={t`Show a “View value” button in tables, boards, calendars and lists. Fetch the value when opened.`}
          disabled={disabled}
        >
          <Switch
            aria-label={t`Load value when opened`}
            size="sm"
            checked={value?.isValueLoadedOnOpen ?? false}
            onCheckedChange={(isValueLoadedOnOpen) =>
              onChange({ ...value, isValueLoadedOnOpen })
            }
            disabled={disabled}
          />
        </SettingsOptionCardContentSelect>
      )}
    />
  );
};
