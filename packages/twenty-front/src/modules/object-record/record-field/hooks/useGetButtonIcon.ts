import { useContext } from 'react';

import { getFieldButtonIcon } from '@/object-record/record-field/utils/getFieldButtonIcon';

import { FieldContext } from '../contexts/FieldContext';
import { IconComponent } from 'twenty-ui/display';

export const useGetButtonIcon = (): IconComponent | undefined => {
  const { fieldDefinition } = useContext(FieldContext);

  return getFieldButtonIcon(fieldDefinition);
};
