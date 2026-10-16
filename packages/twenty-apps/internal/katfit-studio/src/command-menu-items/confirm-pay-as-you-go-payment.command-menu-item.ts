import { defineCommandMenuItem } from 'twenty-sdk/define';

import { CONFIRM_PAY_AS_YOU_GO_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/confirm-pay-as-you-go-payment.front-component';
import { BOOKING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/booking.object';

export default defineCommandMenuItem({
  universalIdentifier: '2aa09209-91c0-4fc4-a9e2-b59839476a60',
  label: 'Подтвердить оплату по факту',
  shortLabel: 'Подтвердить оплату',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier: BOOKING_OBJECT_UNIVERSAL_IDENTIFIER,
  frontComponentUniversalIdentifier:
    CONFIRM_PAY_AS_YOU_GO_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
