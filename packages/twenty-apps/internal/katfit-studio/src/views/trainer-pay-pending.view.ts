import { FIELD_UNIVERSAL_IDENTIFIER as TRAINER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/trainer-on-trainer-pay-entry.field';
import { FIELD_UNIVERSAL_IDENTIFIER as CLASS_SESSION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/class-session-on-trainer-pay-entry.field';
import { defineView, ViewType, ViewFilterOperand } from 'twenty-sdk/define';
import { TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-entry.object';
export default defineView({
  universalIdentifier: '7b1422d0-4cc2-4f9c-8cfd-2cc5d10aaf86',
  name: 'Незавершённые начисления',
  objectUniversalIdentifier: TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCash',
  position: 1,
  filters: [
    {
      universalIdentifier: 'e8f27ca3-8a9d-4631-986b-f81a2676b167',
      fieldMetadataUniversalIdentifier: 'e78b34fb-5152-42bf-85b0-a4328ec12855',
      operand: ViewFilterOperand.IS,
      value: ['PENDING'],
    },
  ],
  fields: [
    {
      universalIdentifier: '3c63c7cd-8911-44be-9a6e-4c1f1328c927',
      fieldMetadataUniversalIdentifier: TRAINER_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'fecf9c07-0c41-454a-baba-425ff5715462',
      fieldMetadataUniversalIdentifier:
        CLASS_SESSION_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '2b699983-a901-46e2-b580-83c1230822d9',
      fieldMetadataUniversalIdentifier: 'e4cd0e6c-d14d-42b6-8e54-80c060df111f',
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'c0c8ca7b-7fc0-4b51-a82f-c3d78ec419ba',
      fieldMetadataUniversalIdentifier: '9ff879c6-dae1-4047-bd4a-1edd5771a42d',
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'de37e766-759b-412b-a8ea-bd8280f8ffa8',
      fieldMetadataUniversalIdentifier: '6ac152d8-6802-4c4c-834f-6bc933e122a5',
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '4b0298d9-5d3f-445d-a774-4617eef78b35',
      fieldMetadataUniversalIdentifier: 'c61de934-7da8-40c8-8a1f-1a0490ee9231',
      position: 5,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '6d770316-ad36-4564-8585-355e2a83cb87',
      fieldMetadataUniversalIdentifier: '251520f9-b092-4f61-8b80-93caa2c8fa0d',
      position: 6,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'a598559e-48e7-4eeb-94cd-4c20cff0acef',
      fieldMetadataUniversalIdentifier: 'e78b34fb-5152-42bf-85b0-a4328ec12855',
      position: 7,
      isVisible: true,
      size: 180,
    },
  ],
});
