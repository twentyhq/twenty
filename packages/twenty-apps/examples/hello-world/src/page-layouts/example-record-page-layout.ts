import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';
import { HELLO_WORLD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/front-components/hello-world';
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '203aeb94-6701-46d6-9af1-be2bbcc9e134',
  name: 'Example Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '6ed26b60-a51d-4ad7-86dd-1c04c7f3cac5',
      title: 'Hello World',
      position: 50,
      icon: 'IconWorld',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'aa4234e0-2e5f-4c02-a96a-573449e2351d',
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
