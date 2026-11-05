import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceApiNamingMetadata } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-metadata.type';
import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { assertWorkspaceApiNameAvailableOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/assert-workspace-api-name-available-or-throw.util';
import { getWorkspaceApiFieldNames } from 'src/engine/api/common/workspace-api-naming/utils/get-workspace-api-field-names.util';

export const validateWorkspaceApiFieldNamesOrThrow = ({
  view,
  metadata,
}: {
  view: WorkspaceApiNamingView;
  metadata: WorkspaceApiNamingMetadata;
}): void => {
  const fieldIdentitiesByObjectId = new Map<string, Map<string, string>>();

  for (const fieldMetadata of Object.values(
    metadata.flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const { universalIdentifier, objectMetadataId } = fieldMetadata;
    const name = view.fields[universalIdentifier] ?? fieldMetadata.name;
    const fieldIdentitiesByName =
      fieldIdentitiesByObjectId.get(objectMetadataId) ??
      new Map<string, string>();

    fieldIdentitiesByObjectId.set(objectMetadataId, fieldIdentitiesByName);

    for (const fieldName of getWorkspaceApiFieldNames({
      flatFieldMetadata: fieldMetadata,
      name,
    })) {
      assertWorkspaceApiNameAvailableOrThrow({
        name: fieldName,
        identity: universalIdentifier,
        identitiesByName: fieldIdentitiesByName,
      });
    }
  }
};
