import { defineObject, FieldType } from 'twenty-sdk/define';

export const TRIGGER_UNIVERSAL_IDENTIFIER =
  'e3fce870-1479-4be7-87f6-5937ad3fcaef';

export const TRIGGER_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '66aaa47d-37b6-4dde-aa7b-967bbac55018';

export default defineObject({
  universalIdentifier: TRIGGER_UNIVERSAL_IDENTIFIER,
  nameSingular: 'trigger',
  namePlural: 'triggers',
  labelSingular: 'Trigger',
  labelPlural: 'Triggers',
  description: 'One record per sleep logic function execution',
  icon: 'IconMoon',
  labelIdentifierFieldMetadataUniversalIdentifier:
    TRIGGER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: TRIGGER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: 'Trigger name',
      icon: 'IconAbc',
      name: 'name',
    },
  ],
});
