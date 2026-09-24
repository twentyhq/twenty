import { type ApplicationTokenPair } from '~/generated-metadata/graphql';

export type FrontComponentApplicationSession = {
  applicationTokenPair: ApplicationTokenPair;
  applicationVariables: Record<string, string>;
  tokenPairObtainedAt: number;
};
