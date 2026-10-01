import { type FindOneFrontComponentQuery } from '~/generated-metadata/graphql';

export type FrontComponentChecksums = Pick<
  NonNullable<FindOneFrontComponentQuery['frontComponent']>,
  'builtComponentChecksum' | 'frontComponentSharedDependenciesChecksum'
>;
