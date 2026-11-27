import { type FindOneFrontComponentQuery } from '~/generated-metadata/graphql';

export type ResolvedFrontComponent = NonNullable<
  FindOneFrontComponentQuery['frontComponent']
>;
