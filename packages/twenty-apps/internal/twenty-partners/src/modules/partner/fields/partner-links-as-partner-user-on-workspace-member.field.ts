import {
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

import { PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  PARTNER_LINKS_AS_PARTNER_USER_FIELD_ID,
  PARTNER_USER_ON_PARTNER_LINK_FIELD_ID,
} from './partner-user-on-partner-link.field';

export default defineField({
  universalIdentifier: PARTNER_LINKS_AS_PARTNER_USER_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'partnerLinksAsPartnerUser',
  label: 'Partner Links (as partner user)',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PARTNER_USER_ON_PARTNER_LINK_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
