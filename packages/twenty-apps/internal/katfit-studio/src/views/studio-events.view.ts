import { defineView, ViewType } from 'twenty-sdk/define';

import { STUDIO_EVENT_NAME_FIELD_UNIVERSAL_IDENTIFIER, STUDIO_EVENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/studio-event.object';

export default defineView({
  universalIdentifier: '00c96ea2-946a-4156-8749-8dbb4c776290', name: 'Все события студии',
  objectUniversalIdentifier: STUDIO_EVENT_OBJECT_UNIVERSAL_IDENTIFIER, type: ViewType.TABLE, icon: 'IconHistory', position: 0,
  fields: [
    { universalIdentifier: '2d40cedd-8e91-4227-a3e9-7d7334f1e4d9', fieldMetadataUniversalIdentifier: STUDIO_EVENT_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 240 },
    { universalIdentifier: '685ed427-cfd0-4819-9473-341eb73e51ae', fieldMetadataUniversalIdentifier: 'e915315e-bbd1-42dc-b89a-d1555e850924', position: 1, isVisible: true, size: 180 },
    { universalIdentifier: '60c6eb41-b0d1-47d3-90ed-bd9ce0a4b0e1', fieldMetadataUniversalIdentifier: '5219f42b-d8c2-4309-a580-c11c3691665f', position: 2, isVisible: true, size: 140 },
    { universalIdentifier: '9bb834e4-c2cf-48fd-b289-2daa52b4ddf4', fieldMetadataUniversalIdentifier: 'e0e3b690-7e05-4fe1-9220-88986146be0f', position: 3, isVisible: true, size: 190 },
    { universalIdentifier: '3e7f11bb-d849-4d6a-8b77-03fbb6fda214', fieldMetadataUniversalIdentifier: '5a304048-a94b-4ebd-a1c2-9db9000a298a', position: 4, isVisible: true, size: 320 },
    { universalIdentifier: '0c31d210-e3ec-4318-9029-1715b5ab2ad4', fieldMetadataUniversalIdentifier: '9b23c9d9-283d-411f-9cb1-6238de46f7eb', position: 5, isVisible: true, size: 360 },
  ],
});
