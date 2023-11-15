import { EntityChipProps } from '@/ui/display/chip/components/EntityChip';
import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/ui/object/field/types/FieldMetadata';

export const getEntityChipFromFieldMetadata = (
  fieldDefinition: FieldDefinition<FieldRelationMetadata>,
  fieldValue: any,
) => {
  const { fieldName } = fieldDefinition.metadata;

  const chipValue: Pick<
    EntityChipProps,
    'name' | 'pictureUrl' | 'avatarType' | 'entityId'
  > = {
    name: '',
    pictureUrl: '',
    avatarType: 'rounded',
    entityId: fieldValue?.id,
  };

  console.log({
    fieldName,
    fieldValue,
  });

  // TODO: use every
  if (fieldName === 'accountOwner' && fieldValue) {
    chipValue.name = fieldValue.firstName + ' ' + fieldValue.lastName;
  }

  return chipValue;
};
