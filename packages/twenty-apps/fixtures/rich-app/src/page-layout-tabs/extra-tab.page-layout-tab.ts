import {
  AggregateOperations,
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
} from 'twenty-sdk/define';

import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

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
    {
      universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000012',
      title: 'Total Priority',
      type: 'GRAPH',
      objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
      configuration: {
        configurationType: 'AGGREGATE_CHART',
        aggregateFieldMetadataUniversalIdentifier:
          '7b57bd63-5a4c-46ca-9d52-42c8f02d1df6',
        aggregateOperation: AggregateOperations.SUM,
      },
    },
  ],
});
