import { type ResolverNameMapEntry } from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';

export type WorkspaceApiNamingBindings = {
  canonicalTypeNameByApiTypeName: Record<string, string>;
  canonicalFieldNameByApiTypeNameAndApiFieldName: Record<
    string,
    Record<string, string>
  >;
  resolverNameMap: {
    Query: Record<string, ResolverNameMapEntry>;
    Mutation: Record<string, ResolverNameMapEntry>;
  };
};
