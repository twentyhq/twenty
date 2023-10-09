import { useContext } from 'react';

import { IconPencil } from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldURL } from '../types/guards/isFieldURL';

export const useGetButtonIcon = (): IconComponent | undefined => {
  const { fieldDefinition } = useContext(FieldContext);
  if (
    isFieldURL(fieldDefinition) ||
    isFieldEmail(fieldDefinition) ||
    isFieldPhone(fieldDefinition) ||
    isFieldRelation(fieldDefinition)
  ) {
    return IconPencil;
  }
};
