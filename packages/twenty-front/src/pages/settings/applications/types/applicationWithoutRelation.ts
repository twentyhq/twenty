import { type FindManyApplicationsQuery } from '~/generated-metadata/graphql';

// Derived from the query result rather than from the schema `Application` type,
// so that dropping a field from FIND_MANY_APPLICATIONS becomes a type error
// instead of a silently undefined value at runtime.
export type ApplicationWithoutRelation =
  FindManyApplicationsQuery['findManyApplications'][number];
