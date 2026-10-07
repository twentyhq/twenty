import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

// A letter runs the button it labels; symbols such as / and @ open the
// command menu from anywhere, and key sequences belong to it too
export const getCommandMenuItemButtonHotKey = ({
  hotKeys,
}: Pick<CommandMenuItemFieldsFragment, 'hotKeys'>) => {
  const [hotKey] = hotKeys ?? [];

  return hotKeys?.length === 1 && /^[a-z]$/i.test(hotKey) ? hotKey : undefined;
};
