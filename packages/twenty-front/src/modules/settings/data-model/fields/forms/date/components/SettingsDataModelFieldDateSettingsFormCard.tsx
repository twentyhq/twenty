import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import {
  SettingsDataModelFieldDateForm,
  type SettingsDataModelFieldDateFormValues,
} from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';
import { useDateSettingsFormInitialValues } from '@/settings/data-model/fields/forms/date/hooks/useDateSettingsFormInitialValues';
import {
  SettingsDataModelFieldPreviewCard,
  type SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';

type SettingsDataModelFieldDateSettingsFormCardProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'isCustom' | 'settings' | 'isUnique'
  > &
    Partial<{ id: string }>;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldDateSettingsFormCard = ({
  disabled,
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldDateSettingsFormCardProps) => {
  const { initialDisplayFormat, initialCustomUnicodeDateFormat } =
    useDateSettingsFormInitialValues({
      fieldMetadataItem,
    });

  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldDateFormValues>();

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledFieldPreviewCard
          fieldMetadataItem={{
            ...fieldMetadataItem,
            settings: {
              displayFormat: watchFormValue(
                'settings.displayFormat',
                initialDisplayFormat,
              ),
              customUnicodeDateFormat: watchFormValue(
                'settings.customUnicodeDateFormat',
                initialCustomUnicodeDateFormat,
              ),
            },
          }}
          objectMetadataItem={objectMetadataItem}
        />
      }
      form={
        <>
          <SettingsDataModelFieldDateForm
            disabled={disabled}
            fieldMetadataItem={fieldMetadataItem}
          />
          <SettingsDataModelFieldIsUniqueForm
            fieldMetadataItem={fieldMetadataItem}
            objectMetadataItem={objectMetadataItem}
          />
        </>
      }
    />
  );
};
