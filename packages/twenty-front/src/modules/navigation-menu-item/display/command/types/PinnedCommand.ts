import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export type PinnedCommand = {
  navigationMenuItemId: string;
  commandMenuItem: CommandMenuItemFieldsFragment;
};
