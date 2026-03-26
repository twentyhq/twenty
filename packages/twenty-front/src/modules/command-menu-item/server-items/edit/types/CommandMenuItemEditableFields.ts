import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export type CommandMenuItemEditableFields = Pick<
  CommandMenuItemFieldsFragment,
  'isPinned' | 'position' | 'shortLabel'
>;
