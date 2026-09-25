import { type ApplicationTokenPair } from '~/generated-metadata/graphql';

export type FrontComponentApplicationTokenPair = ApplicationTokenPair & {
  obtainedAt: number;
};
