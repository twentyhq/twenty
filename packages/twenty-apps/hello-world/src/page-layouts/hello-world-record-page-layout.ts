import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk';

const HELLO_WORLD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'd371f098-5b2c-42f0-898d-94459f1ee337';

export default definePageLayout({
  universalIdentifier: 'ff81ff42-9e05-4e9f-ba1d-89a7e1c47ec1',
  name: 'Hello World Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'bd5f37a3-001e-4a5c-aff0-8ec22e73af4a',
      title: 'Hello World',
      position: 50,
      icon: 'IconWorld',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'b328c57e-bf11-4411-bd52-3abd161c95c3',
          title: 'Hello World',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              HELLO_WORLD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
