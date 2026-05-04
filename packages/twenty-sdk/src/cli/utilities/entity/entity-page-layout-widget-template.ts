import { v4 as uuidv4 } from 'uuid';

export const getPageLayoutWidgetBaseFile = ({ name }: { name: string }) => {
  return `import { definePageLayoutWidget } from 'twenty-sdk/define';

export default definePageLayoutWidget({
  universalIdentifier: '${uuidv4()}',
  pageLayoutTabUniversalIdentifier: 'replace-with-existing-page-layout-tab-uuid',
  title: '${name}',
  type: 'FRONT_COMPONENT',
  configuration: {
    configurationType: 'FRONT_COMPONENT',
    frontComponentUniversalIdentifier:
      'replace-with-existing-front-component-uuid',
  },
});
`;
};
