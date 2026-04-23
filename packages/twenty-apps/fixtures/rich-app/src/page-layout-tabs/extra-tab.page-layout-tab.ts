import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';

export default definePageLayoutTab({
  universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000010',
  pageLayoutUniversalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000020',
  title: 'Extra Tab',
  position: 1000,
  icon: 'IconLayout',
  layoutMode: PageLayoutTabLayoutMode.CANVAS,
  widgets: [
    {
      universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000011',
      title: 'Extra Widget',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          '370ae182-743f-4ecb-b625-7ac48e21f0e5',
      },
    },
  ],
});
