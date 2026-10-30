import { type Agent } from '~/generated-metadata/graphql';

export type FlatAgent = Omit<Agent, 'isCustom'>;
