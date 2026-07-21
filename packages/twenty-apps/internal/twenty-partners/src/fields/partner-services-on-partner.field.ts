import { FieldType, RelationType, defineField } from 'twenty-sdk/define';

import {
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  PARTNER_SERVICES_ON_PARTNER_FIELD_ID,
  PARTNER_SERVICE_PARTNER_FIELD_ID,
} from './partner-service-partner.field';

export default defineField({
  universalIdentifier: PARTNER_SERVICES_ON_PARTNER_FIELD_ID,
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'partnerServices',
  label: 'Partner Services',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_SERVICE_PARTNER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
