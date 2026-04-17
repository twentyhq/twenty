import { RESEND_BROADCASTS_ON_TEMPLATE_ID } from 'src/modules/resend/fields/resend-broadcasts-on-template.field';
import {
  RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  TEMPLATE_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
  TEMPLATE_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/resend/objects/resend-template';
import { defineView } from 'twenty-sdk';

export const RESEND_TEMPLATE_VIEW_UNIVERSAL_IDENTIFIER =
  'c4a00e17-cec7-44f6-85c6-5826a0db8923';

export default defineView({
  universalIdentifier: RESEND_TEMPLATE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Resend templates',
  objectUniversalIdentifier: RESEND_TEMPLATE_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconTemplate',
  position: 0,
  fields: [
    {
      universalIdentifier: '01464797-cd0c-4686-b4fd-8e7f9d2e81d4',
      fieldMetadataUniversalIdentifier:
        TEMPLATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier: 'c9c823c4-27f2-4805-a6ce-e22e97c5ac16',
      fieldMetadataUniversalIdentifier:
        TEMPLATE_SUBJECT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier: '36a274f8-4273-4b16-8a66-99c652ca308d',
      fieldMetadataUniversalIdentifier:
        TEMPLATE_FROM_ADDRESS_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier: '0474cc6b-3e28-4fb6-b0ba-3b22004eb9c4',
      fieldMetadataUniversalIdentifier:
        TEMPLATE_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier: '6bc34358-17b2-40c6-a0bc-3320ac972736',
      fieldMetadataUniversalIdentifier:
        TEMPLATE_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier: 'e3e90309-715c-4962-95d3-ddc46124fc93',
      fieldMetadataUniversalIdentifier:
        TEMPLATE_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 5,
    },
    {
      universalIdentifier: 'cbdff1cf-09de-4855-91c6-978a3e87b795',
      fieldMetadataUniversalIdentifier: RESEND_BROADCASTS_ON_TEMPLATE_ID,
      isVisible: true,
      size: 12,
      position: 6,
    },
  ],
});
