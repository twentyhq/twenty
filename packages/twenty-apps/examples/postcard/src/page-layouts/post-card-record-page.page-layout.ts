import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from 'src/objects/post-card.object';
import { CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/components/card.front-component';

export default definePageLayout({
  universalIdentifier: 'f2bf4b9f-0485-46f0-89bb-9a65d2b939b1',
  name: 'Post Card Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'a8c3d1e2-4f5b-4a6c-9d0e-1f2a3b4c5d6e',
      title: 'Fields',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '3d388201-f421-4189-8266-f632e494091b',
          title: 'Post Card Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: '14dbc57a-5080-48d8-b276-bea9146edff9',
      title: 'Preview',
      position: 50,
      icon: 'IconEye',
      widgets: [
        {
          universalIdentifier: 'd70f837e-8d0c-4fe2-b70e-89b5bc173499',
          title: 'Card Preview',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
