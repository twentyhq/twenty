import { defineView } from 'twenty-sdk';
import { UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers.constant';

export default defineView({
  universalIdentifier:
    UNIVERSAL_IDENTIFIERS.views.selfHostingUserView.universalIdentifier,
  name: 'self-hosting-user-view',
  objectUniversalIdentifier:
    UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.universalIdentifier,
  icon: 'IconList',
  position: 0,
  fields: [
    {
      universalIdentifier: '243a2401-cd13-440c-8dcd-649e26df36bc',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.name
          .universalIdentifier,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: 'dfa75ef8-d40d-416f-9f1c-3e86edfa9fce',
      fieldMetadataUniversalIdentifier:
        UNIVERSAL_IDENTIFIERS.objects.selfHostingUser.fields.email
          .universalIdentifier,
      position: 0,
      isVisible: true,
    },
  ],
});
