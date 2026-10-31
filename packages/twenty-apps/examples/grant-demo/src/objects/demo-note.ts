import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  DEMO_NOTE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  DEMO_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: DEMO_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'demoNote',
  namePlural: 'demoNotes',
  labelSingular: 'Demo note',
  labelPlural: 'Demo notes',
  description: 'Owned by the Grant demo app, requested with every action by default',
  icon: 'IconNotes',
  labelIdentifierFieldMetadataUniversalIdentifier:
    DEMO_NOTE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: DEMO_NOTE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
  ],
});
