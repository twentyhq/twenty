import { useMemo } from 'react';
import { v4 } from 'uuid';

import {
  FieldMetadataItem,
  FieldMetadataItemOption,
} from '@/object-metadata/types/FieldMetadataItem';
import { getOptionValueFromLabel } from '@/settings/data-model/fields/forms/utils/getOptionValueFromLabel';

const DEFAULT_OPTION: FieldMetadataItemOption = {
  color: 'green',
  id: v4(),
  label: 'Option 1',
  position: 0,
  value: getOptionValueFromLabel('Option 1'),
};

export const useSelectSettingsFormInitialValues = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'defaultValue' | 'options'>;
}) => {
  const initialDefaultValue = fieldMetadataItem.defaultValue ?? null;
  const initialOptions = useMemo(
    () =>
      fieldMetadataItem.options?.length
        ? [...fieldMetadataItem.options].sort(
            (optionA, optionB) => optionA.position - optionB.position,
          )
        : [DEFAULT_OPTION],
    [fieldMetadataItem.options],
  );

  return {
    initialDefaultValue,
    initialOptions,
  };
};
