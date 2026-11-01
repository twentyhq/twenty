import { defineView, ViewType } from 'twenty-sdk/define';
import { TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-rate.object';
export default defineView({
  universalIdentifier: 'afa8673d-e50d-47f0-af9d-c25181d48487',
  name: 'Тарифы тренеров',
  objectUniversalIdentifier: TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCash',
  position: 0,
  fields: [
    {
      universalIdentifier: '45352544-7a30-4bce-bbfc-de1a0340e2b2',
      fieldMetadataUniversalIdentifier: '0eda940d-6012-4ffe-8bb0-2cad7406bf24',
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '0a4202ca-83fa-4065-a9b5-2da428fa1da5',
      fieldMetadataUniversalIdentifier: 'ed88e777-ae17-47a2-baa4-5627ffad4728',
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '7416be6e-5dac-49a8-a8ee-3ba5f3da13d9',
      fieldMetadataUniversalIdentifier: 'f319d8b8-19ab-4cda-befa-1020b83f719d',
      position: 2,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '4a584941-5fc5-4279-beee-ad6399203d4e',
      fieldMetadataUniversalIdentifier: '8e01fa6e-8c52-4f98-b8ad-7b448aa9cbd3',
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '59301046-49bc-40fe-a9a4-f000c812d8db',
      fieldMetadataUniversalIdentifier: '6c4e07db-5a86-45f5-ae9c-9638e9f0cb72',
      position: 4,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'e0f84133-1754-4774-bf93-b472716128a9',
      fieldMetadataUniversalIdentifier: 'd90b2fe6-e6ba-4540-bb34-5308afe01363',
      position: 5,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '602da17b-951c-4d38-9001-afd111bb6500',
      fieldMetadataUniversalIdentifier: '514e8203-409a-475f-88c9-3257de5e4d71',
      position: 6,
      isVisible: true,
      size: 180,
    },
  ],
});
