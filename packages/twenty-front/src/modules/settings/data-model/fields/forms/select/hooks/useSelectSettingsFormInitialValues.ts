import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { v4 } from 'uuid';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type SettingsDataModelFieldSelectFormValues } from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectForm';
import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/computeOptionValueFromLabel';

const DEFAULT_OPTION: FieldMetadataItemOption = {
  color: 'green',
  id: v4(),
  label: 'Option 1',
  position: 0,
  value: computeOptionValueFromLabel('Option 1'),
};

type UseSelectSettingsFormInitialValuesProps = {
  fieldMetadataId: string;
};

export const useSelectSettingsFormInitialValues = ({
  fieldMetadataId,
}: UseSelectSettingsFormInitialValuesProps) => {
  const { fieldMetadataItem } = useFieldMetadataItemById(fieldMetadataId);

  const initialDefaultValue =
    (fieldMetadataItem?.defaultValue as SettingsDataModelFieldSelectFormValues['defaultValue']) ??
    null;
  const initialOptions = useMemo(
    () =>
      fieldMetadataItem?.options?.length
        ? [...fieldMetadataItem.options].sort(
            (optionA, optionB) => optionA.position - optionB.position,
          )
        : [DEFAULT_OPTION],
    [fieldMetadataItem?.options],
  );

  const { resetField } =
    useFormContext<SettingsDataModelFieldSelectFormValues>();

  const resetDefaultValueField = () =>
    resetField('defaultValue', { defaultValue: initialDefaultValue });

  return {
    initialDefaultValue,
    initialOptions,
    resetDefaultValueField,
  };
};
