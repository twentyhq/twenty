import {
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

export const OPPORTUNITY_IS_LISTED_FIELD_ID =
  '0384ac3e-7aaa-4f32-bc6c-a6de8ebdd6c3';

// Marketplace flag: a listed brief is visible to all partners. The RLS predicate that exposes
// listed opportunities is wired in a later block; here it is just the field.
export default defineField({
  universalIdentifier: OPPORTUNITY_IS_LISTED_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.BOOLEAN,
  name: 'isListed',
  label: 'Listed',
  icon: 'IconBuildingStore',
  isNullable: true,
});
