import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import {
  PARTNER_AVAILABILITY_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_REGION_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_SUPER_PARTNER_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_TIER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/partner/constants/partner-field-universal-identifiers';
import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_USER_ON_PARTNER_FIELD_ID } from 'src/modules/partner/fields/partner-user-on-partner.field';

export const SUPER_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER =
  'e46cac46-8447-463f-8e8d-51c5eed15740';

export default defineView({
  universalIdentifier: SUPER_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Super partners',
  icon: 'IconStar',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 4,
  fields: [
    {
      universalIdentifier: '9498fd34-4a80-4458-af20-476150ffbec8',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'f2820fb1-a578-44ce-872c-f8df3470f777',
      fieldMetadataUniversalIdentifier:
        PARTNER_SUPER_PARTNER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 90,
    },
    {
      universalIdentifier: 'b947351a-a461-4bc3-a7a9-25e6f0fdd551',
      fieldMetadataUniversalIdentifier: PARTNER_TIER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '4ca37446-0d4b-4dd2-b964-b431ef4e5e48',
      fieldMetadataUniversalIdentifier:
        PARTNER_AVAILABILITY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '83e5d3e6-38c3-4f56-adeb-2265ec61201f',
      fieldMetadataUniversalIdentifier:
        PARTNER_SCOPE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '98de8562-2d00-4965-8963-872d4e5cdff9',
      fieldMetadataUniversalIdentifier:
        PARTNER_REGION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '3b653e5e-538d-4380-a144-c348b3a01523',
      fieldMetadataUniversalIdentifier: PARTNER_USER_ON_PARTNER_FIELD_ID,
      position: 6,
      isVisible: true,
      size: 200,
    },
  ],
  filters: [
    // BOOLEAN fields use ViewFilterOperand.IS with the string value 'true' —
    // the same representation the Twenty frontend stores and reads for boolean IS filters.
    {
      universalIdentifier: '783d033a-935b-4a75-bb5a-d578a5aa6d22',
      fieldMetadataUniversalIdentifier:
        PARTNER_SUPER_PARTNER_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: 'true',
    },
  ],
});
