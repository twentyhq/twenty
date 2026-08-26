import { v4 as uuidv4 } from 'uuid';

export const getCommandMenuItemBaseFile = ({ name }: { name: string }) => {
  return `import { CommandMenuItemAvailabilityType, defineCommandMenuItem } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: '${uuidv4()}',
  frontComponentUniversalIdentifier:
    'replace-with-existing-front-component-uuid',
  label: '${name}',
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
});
`;
};
