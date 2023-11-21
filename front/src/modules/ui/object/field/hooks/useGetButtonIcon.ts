import { useContext } from 'react';

import { IconPencil } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldLink } from '../types/guards/isFieldLink';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldRelation } from '../types/guards/isFieldRelation';

export const useGetButtonIcon = (): IconComponent | undefined => {
  const { fieldDefinition } = useContext(FieldContext);

  if (!fieldDefinition) return undefined;

  if (
    isFieldLink(fieldDefinition) ||
    isFieldEmail(fieldDefinition) ||
    isFieldPhone(fieldDefinition) ||
    isFieldRelation(fieldDefinition)
  ) {
    return IconPencil;
  }
};
