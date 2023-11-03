import { useContext } from 'react';

import { IconPencil } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';

import { FieldContext } from '../contexts/FieldContext';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldMetadata } from '../types/FieldMetadata';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldPhone } from '../types/guards/isFieldPhone';
import { isFieldRelation } from '../types/guards/isFieldRelation';
import { isFieldURL } from '../types/guards/isFieldURL';

export const useGetButtonIcon = (
  customFieldDefinition?: FieldDefinition<FieldMetadata> | null | undefined,
): IconComponent | undefined => {
  const { fieldDefinition } = useContext(FieldContext);

  const usedFieldDefinition = customFieldDefinition ?? fieldDefinition;

  if (!usedFieldDefinition) return undefined;

  if (
    isFieldURL(usedFieldDefinition) ||
    isFieldEmail(usedFieldDefinition) ||
    isFieldPhone(usedFieldDefinition) ||
    isFieldRelation(usedFieldDefinition)
  ) {
    return IconPencil;
  }
};
