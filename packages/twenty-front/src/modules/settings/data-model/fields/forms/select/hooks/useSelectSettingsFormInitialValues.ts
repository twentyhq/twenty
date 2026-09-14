import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type SettingsDataModelFieldSelectFormValues } from '@/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectForm';
import { normalizeSelectOptions } from '@/settings/data-model/fields/forms/select/utils/normalizeSelectOptions';
import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/computeOptionValueFromLabel';

const getDefaultOption = (): FieldMetadataItemOption => {
  const label = t`Option 1`;
  return {
    color: 'green',
    id: v4(),
    label,
    position: 0,
    value: computeOptionValueFromLabel(label),
  };
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
      isNonEmptyArray(fieldMetadataItem?.options)
        ? normalizeSelectOptions(fieldMetadataItem.options)
        : [getDefaultOption()],
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
