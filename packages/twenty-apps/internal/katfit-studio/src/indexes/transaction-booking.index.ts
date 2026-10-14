import { defineIndex } from 'twenty-sdk/define';

import { BOOKING_ON_TRANSACTION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/booking-on-transaction.field';
import {
  MEMBERSHIP_TRANSACTION_OBJECT_UNIVERSAL_IDENTIFIER,
  MEMBERSHIP_TRANSACTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/membership-transaction.object';

export default defineIndex({
  universalIdentifier: '50816416-580b-42d0-ac57-9f29b57cf1c8',
  objectUniversalIdentifier: MEMBERSHIP_TRANSACTION_OBJECT_UNIVERSAL_IDENTIFIER,
  isUnique: true,
  fields: [
    {
      universalIdentifier: 'a19ed852-5a56-47b5-b957-cc320efbb93a',
      fieldUniversalIdentifier:
        BOOKING_ON_TRANSACTION_FIELD_UNIVERSAL_IDENTIFIER,
    },
    {
      universalIdentifier: '0bcae02a-aec5-4fd7-8525-d22331b9d3bd',
      fieldUniversalIdentifier:
        MEMBERSHIP_TRANSACTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
    },
  ],
});
