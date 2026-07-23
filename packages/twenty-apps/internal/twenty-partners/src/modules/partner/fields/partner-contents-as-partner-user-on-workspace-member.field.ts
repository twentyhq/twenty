import {
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

import { PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  PARTNER_CONTENTS_AS_PARTNER_USER_FIELD_ID,
  PARTNER_USER_ON_PARTNER_CONTENT_FIELD_ID,
} from './partner-user-on-partner-content.field';

export default defineField({
  universalIdentifier: PARTNER_CONTENTS_AS_PARTNER_USER_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'partnerContentsAsPartnerUser',
  label: 'Partner Content (as partner user)',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PARTNER_USER_ON_PARTNER_CONTENT_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
