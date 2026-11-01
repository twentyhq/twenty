import { FIELD_UNIVERSAL_IDENTIFIER as TRAINER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/trainer-on-trainer-pay-entry.field';
import { FIELD_UNIVERSAL_IDENTIFIER as CLASS_SESSION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/class-session-on-trainer-pay-entry.field';
import { defineView, ViewType } from 'twenty-sdk/define';
import { TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-entry.object';
export default defineView({
  universalIdentifier: '51849e8a-75c7-4411-848d-e26e4ddcbd2b',
  name: 'Начисления тренерам',
  objectUniversalIdentifier: TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCash',
  position: 0,
  fields: [
    {
      universalIdentifier: '2a195824-6478-431d-aa9c-e1590d7bbd7e',
      fieldMetadataUniversalIdentifier: TRAINER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'a2bc0f7e-4eaa-43ea-913c-623833269fc7',
      fieldMetadataUniversalIdentifier:
        CLASS_SESSION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'a296dd9d-c9e5-4fd8-aef0-83db5264dab8',
      fieldMetadataUniversalIdentifier: 'e4cd0e6c-d14d-42b6-8e54-80c060df111f',
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '1ddc6a98-9c2a-4ad1-be1d-110f76f2d620',
      fieldMetadataUniversalIdentifier: '9ff879c6-dae1-4047-bd4a-1edd5771a42d',
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '60f07606-5696-4282-bc2e-d4f92f7ae553',
      fieldMetadataUniversalIdentifier: '6ac152d8-6802-4c4c-834f-6bc933e122a5',
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '45959238-31ad-4ae4-8377-bb133e64f567',
      fieldMetadataUniversalIdentifier: 'c61de934-7da8-40c8-8a1f-1a0490ee9231',
      position: 5,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '5761a23a-df07-4f09-8936-90c0cca7a6eb',
      fieldMetadataUniversalIdentifier: '251520f9-b092-4f61-8b80-93caa2c8fa0d',
      position: 6,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'b923e56c-29af-43f7-ad7c-d474ef4cf1a3',
      fieldMetadataUniversalIdentifier: 'e78b34fb-5152-42bf-85b0-a4328ec12855',
      position: 7,
      isVisible: true,
      size: 180,
    },
  ],
});
