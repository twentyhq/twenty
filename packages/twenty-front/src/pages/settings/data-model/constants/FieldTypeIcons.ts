import { FieldMetadataType } from '~/generated-metadata/graphql';

export const defaultIconsByFieldType: Record<FieldMetadataType, string> = {
  [FieldMetadataType.Address]: 'IconLocation',
  [FieldMetadataType.Boolean]: 'IconCheckbox',
  [FieldMetadataType.Currency]: 'IconCurrency',
  [FieldMetadataType.Date]: 'IconCalendar',
  [FieldMetadataType.DateTime]: 'IconClock',
  [FieldMetadataType.FullName]: 'IconUser',
  [FieldMetadataType.MultiSelect]: 'IconList',
  [FieldMetadataType.Number]: 'IconNumber',
  [FieldMetadataType.Rating]: 'IconStar',
  [FieldMetadataType.RawJson]: 'IconCode',
  [FieldMetadataType.Relation]: 'IconRelationOneToMany',
  [FieldMetadataType.Select]: 'IconSelect',
  [FieldMetadataType.Text]: 'IconTypography',
  [FieldMetadataType.Uuid]: 'IconKey',
  [FieldMetadataType.Array]: 'IconCodeDots',
  [FieldMetadataType.Emails]: 'IconMail',
  [FieldMetadataType.Links]: 'IconLink',
  [FieldMetadataType.Phones]: 'IconPhone',
  [FieldMetadataType.Actor]: 'IconUsers',
  [FieldMetadataType.Numeric]: 'IconUsers',
  [FieldMetadataType.Position]: 'IconUsers',
  [FieldMetadataType.RichText]: 'IconUsers',
  [FieldMetadataType.TsVector]: 'IconUsers'
};