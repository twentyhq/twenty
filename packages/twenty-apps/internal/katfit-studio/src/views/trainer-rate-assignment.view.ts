import { FIELD_UNIVERSAL_IDENTIFIER as TRAINER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/trainer-on-trainer-rate-assignment.field';
import { FIELD_UNIVERSAL_IDENTIFIER as PAY_RATE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/pay-rate-on-trainer-rate-assignment.field';
import { defineView, ViewType } from 'twenty-sdk/define';
import { TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-rate-assignment.object';
export default defineView({
  universalIdentifier: '0a3bcc7b-a707-4868-bb11-690d7f7b1fba',
  name: 'Назначения тарифов',
  objectUniversalIdentifier:
    TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCash',
  position: 0,
  fields: [
    {
      universalIdentifier: '8cadd6d7-9b6b-4492-b187-c238f7715127',
      fieldMetadataUniversalIdentifier: TRAINER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '9a98e124-626d-4417-b782-66612ba0b775',
      fieldMetadataUniversalIdentifier: PAY_RATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '6514da75-27a3-4edc-ba85-298444b87b04',
      fieldMetadataUniversalIdentifier: 'e5cf4b5f-da02-4ce1-b26a-468ddffecb85',
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'ff7f633b-f79e-4fc4-a69d-c9085e01a992',
      fieldMetadataUniversalIdentifier: 'a592963b-c397-40af-99b7-8f17bda9c951',
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '14757830-3663-49b3-b18d-f5327cdf5152',
      fieldMetadataUniversalIdentifier: '34ebfc8f-0690-4acf-b2c1-28664a75c0d2',
      position: 2,
      isVisible: true,
      size: 180,
    },
  ],
});
