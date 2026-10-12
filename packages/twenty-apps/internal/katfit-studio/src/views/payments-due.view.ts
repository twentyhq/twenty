import { ViewFilterOperand, defineView, ViewType } from 'twenty-sdk/define';

import { PERSON_ON_PAYMENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/person-on-payment.field';
import { PAYMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER, PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/payment.object';

export default defineView({
  universalIdentifier: '2f3b0765-7c0f-4f3d-b6a9-e3d7d5f024c0',
  name: 'К оплате',
  objectUniversalIdentifier: PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCash',
  position: 1,
  filters: [{ universalIdentifier: 'efc9b98d-4434-4a0a-ac43-0d7cc20c76ee', fieldMetadataUniversalIdentifier: 'e019e1bc-c0ea-4224-8d71-977052d2ac43', operand: ViewFilterOperand.IS, value: 'EXPECTED' }],
  fields: [
    { universalIdentifier: 'b11be975-7a11-4e8c-b48a-f983b36e7193', fieldMetadataUniversalIdentifier: PAYMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 300 },
    { universalIdentifier: 'c43134ae-4f63-4b5c-8f05-afc8138d87a9', fieldMetadataUniversalIdentifier: PERSON_ON_PAYMENT_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 190 },
    { universalIdentifier: '6f9bb6b1-4a7d-46a4-83a5-dbd2c5c1e50a', fieldMetadataUniversalIdentifier: '46246b5f-f5c3-4493-b1ae-e3ae959ae0fa', position: 2, isVisible: true, size: 150 },
  ],
});
