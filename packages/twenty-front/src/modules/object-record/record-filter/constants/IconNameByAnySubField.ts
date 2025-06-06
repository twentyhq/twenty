import { FieldMetadataType } from 'twenty-shared/types';

export const ICON_NAME_BY_ANY_SUB_FIELD: Partial<
  Record<FieldMetadataType, string>
> = {
  [FieldMetadataType.LINKS]: 'IconLink',
  [FieldMetadataType.EMAILS]: 'IconMail',
  [FieldMetadataType.PHONES]: 'IconPhone',
  [FieldMetadataType.ADDRESS]: 'IconMap',
  [FieldMetadataType.ACTOR]: 'IconCreativeCommonsSa',
  [FieldMetadataType.FULL_NAME]: 'IconUser',
  [FieldMetadataType.POSITION]: 'IconBriefcase',
};
