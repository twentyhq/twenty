import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { v4 } from 'uuid';

import {
  FieldMetadataItem,
  FieldMetadataItemOption,
} from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelFieldSelectFormValues } from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectForm';
import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/compute-option-value-from-label.utils';

const DEFAULT_OPTION: FieldMetadataItemOption = {
  color: 'green',
  id: v4(),
  label: 'Option 1',
  position: 0,
  value: computeOptionValueFromLabel('Option 1'),
};

export const useSelectSettingsFormInitialValues = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'defaultValue' | 'options'>;
}) => {
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
