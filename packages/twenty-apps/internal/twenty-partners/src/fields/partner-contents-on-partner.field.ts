import { FieldType, RelationType, defineField } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER, PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_CONTENTS_ON_PARTNER_FIELD_ID, PARTNER_CONTENT_PARTNER_FIELD_ID } from './partner-content-partner.field';

export default defineField({
  universalIdentifier: PARTNER_CONTENTS_ON_PARTNER_FIELD_ID,
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'partnerContents',
  label: 'Partner Content',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_CONTENT_PARTNER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
