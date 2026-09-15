import { FieldType, RelationType, defineField } from 'twenty-sdk/define';

import {
  PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  PARTNER_LINK_PARTNER_FIELD_ID,
  PARTNER_LINKS_ON_PARTNER_FIELD_ID,
} from './partner-link-partner.field';

export default defineField({
  universalIdentifier: PARTNER_LINKS_ON_PARTNER_FIELD_ID,
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'partnerLinks',
  label: 'Partner Links',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_LINK_PARTNER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
