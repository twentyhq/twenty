import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceApiNamingBindings } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-bindings.type';
import { type WorkspaceApiNamingMetadata } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-metadata.type';
import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { getWorkspaceApiObjectTypeBindingsOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-object-type-bindings-or-throw.util';
import { validateWorkspaceApiNamingViewOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/validate-workspace-api-naming-view-or-throw.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';
import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { getResolverName } from 'src/engine/utils/get-resolver-name.util';

const ROOT_OPERATIONS: {
  rootTypeName: 'Query' | 'Mutation';
  operationType: 'query' | 'mutation';
  methods: readonly WorkspaceResolverBuilderMethodNames[];
}[] = [
  {
    rootTypeName: 'Query',
    operationType: 'query',
    methods: workspaceResolverBuilderMethodNames.queries,
  },
  {
    rootTypeName: 'Mutation',
    operationType: 'mutation',
    methods: workspaceResolverBuilderMethodNames.mutations,
  },
];

export const buildWorkspaceApiNamingBindingsOrThrow = ({
  metadata,
  view,
}: {
  metadata: WorkspaceApiNamingMetadata;
  view: WorkspaceApiNamingView;
}): WorkspaceApiNamingBindings => {
  validateWorkspaceApiNamingViewOrThrow({ metadata, view });

  const bindings: WorkspaceApiNamingBindings = {
    canonicalTypeNameByApiTypeName: { Query: 'Query', Mutation: 'Mutation' },
    canonicalFieldNameByApiTypeNameAndApiFieldName: {
      Query: {},
      Mutation: {},
    },
    resolverNameMap: { Query: {}, Mutation: {} },
  };

  for (const flatObjectMetadata of Object.values(
    metadata.flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const fields = getFlatFieldsFromFlatObjectMetadata(
      flatObjectMetadata,
      metadata.flatFieldMetadataMaps,
    );
    const objectTypeBindings = getWorkspaceApiObjectTypeBindingsOrThrow({
      flatObjectMetadata,
      fields,
      flatIndexMaps: metadata.flatIndexMaps,
      view,
    });

    Object.assign(
      bindings.canonicalTypeNameByApiTypeName,
      objectTypeBindings.canonicalTypeNameByApiTypeName,
    );
    Object.assign(
      bindings.canonicalFieldNameByApiTypeNameAndApiFieldName,
      objectTypeBindings.canonicalFieldNameByApiTypeNameAndApiFieldName,
    );

    const apiObjectNames =
      view.objects[flatObjectMetadata.universalIdentifier] ??
      flatObjectMetadata;

    for (const { rootTypeName, operationType, methods } of ROOT_OPERATIONS) {
      for (const method of methods) {
        const isUnavailableDuplicateResolver =
          method === RESOLVER_METHOD_NAMES.FIND_DUPLICATES &&
          !isDefined(flatObjectMetadata.duplicateCriteria);

        if (isUnavailableDuplicateResolver) {
          continue;
        }

        const apiResolverName = getResolverName(apiObjectNames, method);

        bindings.resolverNameMap[rootTypeName][apiResolverName] = {
          objectMetadataUniversalIdentifier:
            flatObjectMetadata.universalIdentifier,
          method,
          operationType,
        };
        bindings.canonicalFieldNameByApiTypeNameAndApiFieldName[rootTypeName][
          apiResolverName
        ] = getResolverName(flatObjectMetadata, method);
      }
    }
  }

  return bindings;
};
