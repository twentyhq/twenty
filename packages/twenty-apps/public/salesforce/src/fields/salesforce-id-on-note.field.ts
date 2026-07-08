import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { SALESFORCE_ID_ON_NOTE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: SALESFORCE_ID_ON_NOTE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note.universalIdentifier,
  type: FieldType.TEXT,
  name: 'salesforceId',
  label: 'Salesforce Id',
  description:
    'Id of the Salesforce record this note was migrated from. Used to keep re-runs idempotent.',
  icon: 'IconCloud',
  isNullable: true,
  isUIEditable: false,
});
