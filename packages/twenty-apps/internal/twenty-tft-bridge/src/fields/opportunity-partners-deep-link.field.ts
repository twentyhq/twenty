import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';
import { OPP_PARTNERS_DEEP_LINK_FIELD_UUID } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPP_PARTNERS_DEEP_LINK_FIELD_UUID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.LINKS,
  name: 'partnersDeepLink',
  label: 'Partners deep link',
  description: 'Link to this opportunity in the partners workspace (set by reverse echo)',
  isNullable: true,
});
