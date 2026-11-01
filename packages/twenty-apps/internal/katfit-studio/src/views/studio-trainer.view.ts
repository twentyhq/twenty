import { defineView, ViewType } from 'twenty-sdk/define';
import { STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/studio-trainer.object';
export default defineView({
  universalIdentifier: '42c5f877-6e72-424f-99f9-085e6605fbe8',
  name: 'Тренеры',
  objectUniversalIdentifier: STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconUser',
  position: 0,
  fields: [
    {
      universalIdentifier: '35783c47-2e20-4bc3-9244-ad7fdd5272e2',
      fieldMetadataUniversalIdentifier: '61adf79c-36ce-498e-8db7-0a82a034412d',
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '7280dd1a-8265-4e93-98e2-24a331e7339a',
      fieldMetadataUniversalIdentifier: 'bcbb1e7f-ebec-4bd1-b26b-35ea22224587',
      position: 1,
      isVisible: true,
      size: 180,
    },
  ],
});
