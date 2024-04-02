import { useContext } from 'react';
import { IconPencil } from 'twenty-ui';

import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { FieldContext } from '../contexts/FieldContext';
import { isFieldEmail } from '../types/guards/isFieldEmail';
import { isFieldLink } from '../types/guards/isFieldLink';
import { isFieldPhone } from '../types/guards/isFieldPhone';

export const useGetButtonIcon = (): IconComponent | undefined => {
  const { fieldDefinition } = useContext(FieldContext);

  if (isUndefinedOrNull(fieldDefinition)) return undefined;

  if (
    isFieldLink(fieldDefinition) ||
    isFieldEmail(fieldDefinition) ||
    isFieldPhone(fieldDefinition)
  ) {
    return IconPencil;
  }

  if (isFieldRelation(fieldDefinition)) {
    if (
      fieldDefinition.metadata.relationObjectMetadataNameSingular !==
      'workspaceMember'
    ) {
      return IconPencil;
    }
  }
};
