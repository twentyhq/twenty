import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export type CommandMenuItemDefinition = CommandMenuItemFieldsFragment & {
  creationTargetObjectMetadataId?: string;
};
