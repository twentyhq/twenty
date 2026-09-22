import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const WORKFLOW_CORE_POINTER_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflow.fields.coreWorkflowId.universalIdentifier;

export const getWorkflowCorePointerColumns = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string[] => {
  if (flatObjectMetadata.nameSingular !== CoreObjectNameSingular.Workflow) {
    return [];
  }

  const corePointerField =
    findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier: WORKFLOW_CORE_POINTER_FIELD_UNIVERSAL_IDENTIFIER,
    });

  return isDefined(corePointerField) ? [corePointerField.name] : [];
};
