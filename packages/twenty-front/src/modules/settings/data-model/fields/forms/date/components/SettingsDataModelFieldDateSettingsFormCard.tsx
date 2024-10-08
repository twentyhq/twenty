import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import {
  SettingsDataModelFieldDateForm,
  SettingsDataModelFieldDateFormValues,
} from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateForm';
import { useDateSettingsFormInitialValues } from '@/settings/data-model/fields/forms/date/hooks/useDateSettingsFormInitialValues';
import {
  SettingsDataModelFieldPreviewCard,
  SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';

type SettingsDataModelFieldDateSettingsFormCardProps = {
  disabled?: boolean;
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'icon' | 'label' | 'type' | 'settings'
  >;
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
  const { initialDisplayAsRelativeDateValue } =
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
              displayAsRelativeDate: watchFormValue(
                'settings.displayAsRelativeDate',
                initialDisplayAsRelativeDateValue,
              ),
            },
          }}
          objectMetadataItem={objectMetadataItem}
        />
      }
      form={
        <SettingsDataModelFieldDateForm
          disabled={disabled}
          fieldMetadataItem={fieldMetadataItem}
        />
      }
    />
  );
};
