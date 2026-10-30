import { type CurrentUserApplicationAuthorizationsQuery } from '~/generated-metadata/graphql';

export type BuiltInMcpClientAppAuthorization =
  CurrentUserApplicationAuthorizationsQuery['currentUserApplicationAuthorizations'][number];
