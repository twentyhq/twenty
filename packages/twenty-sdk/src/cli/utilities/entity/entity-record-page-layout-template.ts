import { v4 as uuidv4 } from 'uuid';

export const getRecordPageLayoutBaseFile = ({
  objectLabelSingular,
  objectUniversalIdentifier,
  fieldsWidgetViewUniversalIdentifier,
}: {
  objectLabelSingular: string;
  objectUniversalIdentifier: string;
  fieldsWidgetViewUniversalIdentifier: string;
}) => {
  return `import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

export default definePageLayout({
  universalIdentifier: '${uuidv4()}',
  name: 'Default ${objectLabelSingular} Layout',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: '${objectUniversalIdentifier}',
  tabs: [
    {
      universalIdentifier: '${uuidv4()}',
      title: 'Home',
      position: 10,
      icon: 'IconHome',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '${uuidv4()}',
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
      universalIdentifier: '${uuidv4()}',
      title: 'Timeline',
      position: 20,
      icon: 'IconTimelineEvent',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: '${uuidv4()}',
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
