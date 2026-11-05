import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceApiNamingMetadata } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-metadata.type';
import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { assertWorkspaceApiNameAvailableOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/assert-workspace-api-name-available-or-throw.util';
import { getWorkspaceApiObjectTypeNames } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-object-type-names.util';
import { getWorkspaceApiFieldTypeNames } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-field-type-names.util';
import { getWorkspaceApiSharedTypeNames } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-shared-type-names.util';
import { getWorkspaceApiUniqueFieldTypeNames } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-unique-field-type-names.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { getResolverName } from 'src/engine/utils/get-resolver-name.util';

const QUERY_METHOD_NAMES = new Set<WorkspaceResolverBuilderMethodNames>([
  RESOLVER_METHOD_NAMES.FIND_MANY,
  RESOLVER_METHOD_NAMES.FIND_ONE,
  RESOLVER_METHOD_NAMES.FIND_DUPLICATES,
  RESOLVER_METHOD_NAMES.GROUP_BY,
]);
const RESOLVER_METHODS = Object.values(RESOLVER_METHOD_NAMES);

const RESERVED_GRAPHQL_TYPE_NAMES = getWorkspaceApiSharedTypeNames();

export const validateWorkspaceApiObjectNamesOrThrow = ({
  view,
  metadata,
}: {
  view: WorkspaceApiNamingView;
  metadata: WorkspaceApiNamingMetadata;
}): void => {
  const objectIdentitiesByName = new Map<string, string>();
  const queryIdentitiesByName = new Map<string, string>();
  const mutationIdentitiesByName = new Map<string, string>();
  const typeIdentitiesByName = new Map<string, string>(
    RESERVED_GRAPHQL_TYPE_NAMES.map((name) => [name, 'GraphQL built-in']),
  );

  for (const objectMetadata of Object.values(
    metadata.flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const { universalIdentifier } = objectMetadata;
    const names = view.objects[universalIdentifier] ?? objectMetadata;

    for (const name of [names.nameSingular, names.namePlural]) {
      assertWorkspaceApiNameAvailableOrThrow({
        name,
        identity: universalIdentifier,
        identitiesByName: objectIdentitiesByName,
      });
    }

    for (const typeName of getWorkspaceApiObjectTypeNames(names.nameSingular)) {
      assertWorkspaceApiNameAvailableOrThrow({
        name: typeName,
        identity: universalIdentifier,
        identitiesByName: typeIdentitiesByName,
      });
    }

    for (const method of RESOLVER_METHODS) {
      assertWorkspaceApiNameAvailableOrThrow({
        name: getResolverName(names, method),
        identity: `${universalIdentifier}:${method}`,
        identitiesByName: QUERY_METHOD_NAMES.has(method)
          ? queryIdentitiesByName
          : mutationIdentitiesByName,
      });
    }

    const fields = findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: metadata.flatFieldMetadataMaps,
      flatEntityIds: objectMetadata.fieldIds,
    });
    for (const fieldMetadata of fields) {
      for (const typeName of getWorkspaceApiFieldTypeNames({
        objectNameSingular: names.nameSingular,
        flatFieldMetadata: fieldMetadata,
        name:
          view.fields[fieldMetadata.universalIdentifier] ?? fieldMetadata.name,
      })) {
        assertWorkspaceApiNameAvailableOrThrow({
          name: typeName,
          identity: `${universalIdentifier}:${fieldMetadata.universalIdentifier}`,
          identitiesByName: typeIdentitiesByName,
        });
      }
    }

    for (const {
      name,
      fieldUniversalIdentifier,
    } of getWorkspaceApiUniqueFieldTypeNames({
      flatObjectMetadata: objectMetadata,
      fields,
      objectNameSingular: names.nameSingular,
      flatIndexMaps: metadata.flatIndexMaps,
      view,
    })) {
      assertWorkspaceApiNameAvailableOrThrow({
        name,
        identity: `${universalIdentifier}:${fieldUniversalIdentifier}`,
        identitiesByName: typeIdentitiesByName,
      });
    }
  }
};
