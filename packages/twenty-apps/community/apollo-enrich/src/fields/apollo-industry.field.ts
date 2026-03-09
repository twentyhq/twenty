import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

export default defineField({
  universalIdentifier: '505532f5-1fc5-4a58-8074-ba9b48650dbc',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.TEXT,
  name: 'apolloIndustry',
  label: 'Apollo Industry',
  description: 'Industry classification from Apollo enrichment',
  icon: 'IconBuildingFactory',
});
