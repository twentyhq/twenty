import { randomUUID } from 'node:crypto';

import { printTypescriptValue } from '@/app/pull/print-typescript-value';

export const getRecordPageLayoutBaseFile = ({
  objectLabelSingular,
  objectUniversalIdentifier,
  fieldsWidgetViewUniversalIdentifier,
}: {
  objectLabelSingular: string;
  objectUniversalIdentifier: string;
  fieldsWidgetViewUniversalIdentifier: string;
}) => {
  return `import { definePageLayout, PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '${randomUUID()}',
  name: ${printTypescriptValue({ value: `Default ${objectLabelSingular} Layout` })},
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: '${objectUniversalIdentifier}',
  tabs: [
    {
      universalIdentifier: '${randomUUID()}',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '${randomUUID()}',
          title: 'Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
            viewUniversalIdentifier: '${fieldsWidgetViewUniversalIdentifier}',
          },
        },
      ],
    },
    {
      universalIdentifier: '${randomUUID()}',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '${randomUUID()}',
          title: 'Timeline',
          type: 'TIMELINE',
          configuration: {
            configurationType: 'TIMELINE',
          },
        },
      ],
    },
  ],
});
`;
};
