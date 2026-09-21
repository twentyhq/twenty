import { v4 as uuidv4 } from 'uuid';

export const getSettingPageBaseFile = ({ name }: { name: string }) => {
  return `import { defineSettingPage } from 'twenty-sdk/define';

export default defineSettingPage({
  universalIdentifier: '${uuidv4()}',
  frontComponentUniversalIdentifier:
    'replace-with-existing-front-component-uuid',
  title: '${name}',
});
`;
};
