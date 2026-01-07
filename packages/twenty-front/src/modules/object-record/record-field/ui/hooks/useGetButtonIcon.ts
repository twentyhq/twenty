import { useContext } from 'react';

import { getFieldButtonIcon } from '@/object-record/record-field/ui/utils/getFieldButtonIcon';

import { type IconComponent } from 'twenty-ui/display';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

export const useGetButtonIcon = (): IconComponent | undefined => {
  const { fieldDefinition } = useContext(FieldContext);

  return getFieldButtonIcon(fieldDefinition);
};
