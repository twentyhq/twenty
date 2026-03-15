import { type CommandMenuItem } from '~/generated-metadata/graphql';

export type FlatCommandMenuItem = Omit<CommandMenuItem, 'frontComponent'>;
