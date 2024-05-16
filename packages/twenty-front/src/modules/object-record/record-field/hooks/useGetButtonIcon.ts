import { useContext } from 'react';
import { IconComponent } from 'twenty-ui';

import { getFieldButtonIcon } from '@/object-record/record-field/utils/getFieldButtonIcon';

import { FieldContext } from '../contexts/FieldContext';

export const useGetButtonIcon = (): IconComponent | undefined => {
  const { fieldDefinition } = useContext(FieldContext);

  return getFieldButtonIcon(fieldDefinition);
};
