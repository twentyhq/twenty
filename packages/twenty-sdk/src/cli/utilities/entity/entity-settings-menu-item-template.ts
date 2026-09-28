import { v4 as uuidv4 } from 'uuid';

export const getSettingsMenuItemBaseFile = ({ name }: { name: string }) => {
  return `import { defineSettingsMenuItem } from 'twenty-sdk/define';

export default defineSettingsMenuItem({
  universalIdentifier: '${uuidv4()}',
  frontComponentUniversalIdentifier:
    'replace-with-existing-front-component-uuid',
  title: '${name}',
});
`;
};
