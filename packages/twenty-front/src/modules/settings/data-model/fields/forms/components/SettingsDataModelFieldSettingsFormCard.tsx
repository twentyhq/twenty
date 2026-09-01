import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { SettingsDataModelFieldAddressSettingsFormCard } from '@/settings/data-model/fields/forms/address/components/SettingsDataModelFieldAddressSettingsFormCard';
import { SettingsDataModelFieldBooleanSettingsFormCard } from '@/settings/data-model/fields/forms/boolean/components/SettingsDataModelFieldBooleanSettingsFormCard';
import { SettingsDataModelFieldIsUniqueForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIsUniqueForm';
import { SettingsDataModelFieldMaxValuesForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldMaxValuesForm';
import { SettingsDataModelFieldTextSettingsFormCard } from '@/settings/data-model/fields/forms/components/text/SettingsDataModelFieldTextSettingsFormCard';
import { SettingsDataModelFieldCurrencySettingsFormCard } from '@/settings/data-model/fields/forms/currency/components/SettingsDataModelFieldCurrencySettingsFormCard';
import { SettingsDataModelFieldDateSettingsFormCard } from '@/settings/data-model/fields/forms/date/components/SettingsDataModelFieldDateSettingsFormCard';
import { SettingsDataModelFieldNumberSettingsFormCard } from '@/settings/data-model/fields/forms/number/components/SettingsDataModelFieldNumberSettingsFormCard';
import { SettingsDataModelFieldPhonesSettingsFormCard } from '@/settings/data-model/fields/forms/phones/components/SettingsDataModelFieldPhonesSettingsFormCard';
import { SettingsDataModelFieldSelectSettingsFormCard } from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectSettingsFormCard';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';

import { Separator } from '@/settings/components/Separator';
import { SettingsDataModelFieldLinksVariantForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldLinksVariantForm';
import { SettingsDataModelFieldOnClickActionForm } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldOnClickActionForm';
import { SettingsDataModelFieldRelationFormCard } from '@/settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldRelationFormCard';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { type SettingsDataModelFieldEditFormValues } from '@/settings/data-model/types/SettingsDataModelFieldEditFormValues';

type SettingsDataModelFieldSettingsFormCardProps = {
  existingFieldMetadataId: string;
  fieldType: FieldMetadataType;
  objectNameSingular: string;
  disabled?: boolean;
};

const previewableTypes = [
  FieldMetadataType.ARRAY,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.EMAILS,
  FieldMetadataType.FILES,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.LINKS,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.PHONES,
  FieldMetadataType.RATING,
  FieldMetadataType.RAW_JSON,
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
  FieldMetadataType.RICH_TEXT,
  FieldMetadataType.SELECT,
  FieldMetadataType.TEXT,
  FieldMetadataType.UUID,
];

export const SettingsDataModelFieldSettingsFormCard = ({
  existingFieldMetadataId,
  fieldType,
  objectNameSingular,
  disabled = false,
}: SettingsDataModelFieldSettingsFormCardProps) => {
  const { watch } = useFormContext<SettingsDataModelFieldEditFormValues>();

  if (!previewableTypes.includes(fieldType)) {
    return null;
  }

  if (fieldType === FieldMetadataType.BOOLEAN) {
    return (
      <SettingsDataModelFieldBooleanSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
        disabled={disabled}
      />
    );
  }

  if (fieldType === FieldMetadataType.CURRENCY) {
    return (
      <SettingsDataModelFieldCurrencySettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
        disabled={disabled}
      />
    );
  }

  if (
    fieldType === FieldMetadataType.DATE ||
    fieldType === FieldMetadataType.DATE_TIME
  ) {
    return (
      <SettingsDataModelFieldDateSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        fieldType={fieldType}
        objectNameSingular={objectNameSingular}
        disabled={disabled}
      />
    );
  }

  if (
    fieldType === FieldMetadataType.RELATION ||
    fieldType === FieldMetadataType.MORPH_RELATION
  ) {
    return (
      <SettingsDataModelFieldRelationFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
        disabled={disabled}
      />
    );
  }

  if (fieldType === FieldMetadataType.NUMBER) {
    return (
      <SettingsDataModelFieldNumberSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
        disabled={disabled}
      />
    );
  }

  if (fieldType === FieldMetadataType.TEXT) {
    return (
      <SettingsDataModelFieldTextSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
        disabled={disabled}
      />
    );
  }

  if (fieldType === FieldMetadataType.ADDRESS) {
    return (
      <SettingsDataModelFieldAddressSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
        disabled={disabled}
      />
    );
  }

  if (fieldType === FieldMetadataType.PHONES) {
    return (
      <SettingsDataModelFieldPhonesSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        objectNameSingular={objectNameSingular}
        disabled={disabled}
      />
    );
  }

  if (
    fieldType === FieldMetadataType.SELECT ||
    fieldType === FieldMetadataType.MULTI_SELECT
  ) {
    return (
      <SettingsDataModelFieldSelectSettingsFormCard
        existingFieldMetadataId={existingFieldMetadataId}
        fieldType={fieldType}
        objectNameSingular={objectNameSingular}
        disabled={disabled}
      />
    );
  }

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <SettingsDataModelFieldPreviewWidget
          fieldMetadataItem={{
            type: fieldType,
            label: watch('label'),
            icon: watch('icon'),
            defaultValue: watch('defaultValue'),
            settings: watch('settings'),
          }}
          objectNameSingular={objectNameSingular}
        />
      }
      form={
        <>
          {[
            FieldMetadataType.EMAILS,
            FieldMetadataType.LINKS,
            FieldMetadataType.ARRAY,
            FieldMetadataType.FILES,
          ].includes(fieldType) && (
            <>
              <SettingsDataModelFieldMaxValuesForm
                existingFieldMetadataId={existingFieldMetadataId}
                fieldType={fieldType}
                disabled={disabled}
              />
              <Separator />
            </>
          )}
          {fieldType === FieldMetadataType.LINKS && (
            <>
              <SettingsDataModelFieldLinksVariantForm
                existingFieldMetadataId={existingFieldMetadataId}
                disabled={disabled}
              />
              <Separator />
            </>
          )}
          {[FieldMetadataType.EMAILS, FieldMetadataType.LINKS].includes(
            fieldType,
          ) && (
            <>
              <SettingsDataModelFieldOnClickActionForm
                existingFieldMetadataId={existingFieldMetadataId}
                fieldType={
                  fieldType as
                    | FieldMetadataType.EMAILS
                    | FieldMetadataType.LINKS
                }
                disabled={disabled}
              />
              <Separator />
            </>
          )}
          <SettingsDataModelFieldIsUniqueForm
            fieldType={fieldType}
            existingFieldMetadataId={existingFieldMetadataId}
            objectNameSingular={objectNameSingular}
            disabled={disabled}
          />
        </>
      }
    />
  );
};
