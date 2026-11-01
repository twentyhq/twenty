import { defineObject, FieldType } from 'twenty-sdk/define';

export const STUDIO_TRAINER_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '61adf79c-36ce-498e-8db7-0a82a034412d';
export const STUDIO_TRAINER_ACTIVE_FIELD_UNIVERSAL_IDENTIFIER =
  'bcbb1e7f-ebec-4bd1-b26b-35ea22224587';
export const STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER =
  'b8eb41d6-2766-4440-97f4-7ae0ccb6ac06';

export default defineObject({
  universalIdentifier: STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'studioTrainer',
  namePlural: 'studioTrainers',
  labelSingular: 'Тренер',
  labelPlural: 'Тренеры',
  icon: 'IconUser',
  labelIdentifierFieldMetadataUniversalIdentifier:
    STUDIO_TRAINER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: '61adf79c-36ce-498e-8db7-0a82a034412d',
      name: 'name',
      label: 'Имя тренера',
      type: FieldType.TEXT,
      icon: 'IconAbc',
    },
    {
      universalIdentifier: 'bcbb1e7f-ebec-4bd1-b26b-35ea22224587',
      name: 'active',
      label: 'Активен',
      defaultValue: true,
      type: FieldType.BOOLEAN,
      icon: 'IconCheck',
    },
  ],
});
