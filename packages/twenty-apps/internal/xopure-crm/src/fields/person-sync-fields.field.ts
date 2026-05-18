import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export const PERSON_XOPURE_SUPABASE_ID_FIELD_ID =
  '895df855-c6b8-4ab8-b483-a50ea36eba79';

export default defineField({
  universalIdentifier: PERSON_XOPURE_SUPABASE_ID_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'xopureSupabasePersonId',
  label: 'XO Pure Supabase person ID',
  description: 'Stable source identifier for Supabase-to-Twenty sync matching.',
  icon: 'IconDatabase',
  isUnique: true,
});
