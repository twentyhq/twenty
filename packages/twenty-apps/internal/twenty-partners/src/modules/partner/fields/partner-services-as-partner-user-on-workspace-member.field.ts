import {
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

import { PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  PARTNER_SERVICES_AS_PARTNER_USER_FIELD_ID,
  PARTNER_USER_ON_PARTNER_SERVICE_FIELD_ID,
} from './partner-user-on-partner-service.field';

export default defineField({
  universalIdentifier: PARTNER_SERVICES_AS_PARTNER_USER_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'partnerServicesAsPartnerUser',
  label: 'Partner Services (as partner user)',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PARTNER_USER_ON_PARTNER_SERVICE_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
