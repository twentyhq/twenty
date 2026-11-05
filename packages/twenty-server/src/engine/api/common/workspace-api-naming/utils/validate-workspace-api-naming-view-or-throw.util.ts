import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  isFieldMetadataSupportedInGroupBy,
} from 'twenty-shared/utils';

import { type WorkspaceApiNamingMetadata } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-metadata.type';
import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { validateWorkspaceApiFieldNamesOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/validate-workspace-api-field-names-or-throw.util';
import { validateWorkspaceApiObjectNamesOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/validate-workspace-api-object-names-or-throw.util';
import { WorkspaceApiNamingException } from 'src/engine/api/common/workspace-api-naming/workspace-api-naming.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { validateFlatFieldMetadataName } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name.util';
import { validateFlatObjectMetadataNames } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-name.util';

export const validateWorkspaceApiNamingViewOrThrow = ({
  view,
  metadata,
}: {
  view: WorkspaceApiNamingView;
  metadata: WorkspaceApiNamingMetadata;
}): void => {
  if (!isNonEmptyString(view.id.trim())) {
    throw new WorkspaceApiNamingException('API naming view ID is empty');
  }

  for (const [universalIdentifier, names] of Object.entries(view.objects)) {
    const objectMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: metadata.flatObjectMetadataMaps,
      universalIdentifier,
    });

    if (!isDefined(objectMetadata)) {
      throw new WorkspaceApiNamingException(
        `Unknown object universal identifier ${universalIdentifier}`,
      );
    }

    const [error] = validateFlatObjectMetadataNames(names);

    if (isDefined(error)) {
      throw new WorkspaceApiNamingException(error.message);
    }
  }

  for (const [universalIdentifier, name] of Object.entries(view.fields)) {
    const fieldMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: metadata.flatFieldMetadataMaps,
      universalIdentifier,
    });

    if (!isDefined(fieldMetadata)) {
      throw new WorkspaceApiNamingException(
        `Unknown field universal identifier ${universalIdentifier}`,
      );
    }

    if (name === fieldMetadata.name) {
      continue;
    }

    if (fieldMetadata.name === 'id') {
      throw new WorkspaceApiNamingException(
        'The primary ID field cannot use a different API name',
      );
    }

    const supportsCanonicalGroupBy =
      isFieldMetadataSupportedInGroupBy(fieldMetadata);
    const supportsApiGroupBy = isFieldMetadataSupportedInGroupBy({
      ...fieldMetadata,
      name,
    });

    if (supportsCanonicalGroupBy !== supportsApiGroupBy) {
      throw new WorkspaceApiNamingException(
        `API field name "${name}" changes grouping eligibility`,
      );
    }

    const [error] = validateFlatFieldMetadataName({
      name,
      buildOptions: {
        isSystemBuild: false,
        applicationUniversalIdentifier:
          fieldMetadata.applicationUniversalIdentifier,
      },
    });

    if (isDefined(error)) {
      throw new WorkspaceApiNamingException(error.message);
    }
  }

  validateWorkspaceApiObjectNamesOrThrow({ view, metadata });
  validateWorkspaceApiFieldNamesOrThrow({ view, metadata });
};
