import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getWorkflowCorePointerColumns } from 'src/engine/core-modules/search/utils/get-workflow-core-pointer-columns.util';

const CORE_POINTER_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workflow.fields.coreWorkflowId.universalIdentifier;

const buildFlatFieldMetadataMaps = (
  universalIdentifiers: string[],
): FlatEntityMaps<FlatFieldMetadata> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      universalIdentifiers.map((universalIdentifier) => [
        universalIdentifier,
        { universalIdentifier, name: 'coreWorkflowId' },
      ]),
    ),
  }) as unknown as FlatEntityMaps<FlatFieldMetadata>;

describe('getWorkflowCorePointerColumns', () => {
  it('selects the mirror pointer column on the workflow object', () => {
    expect(
      getWorkflowCorePointerColumns({
        flatObjectMetadata: { nameSingular: 'workflow' },
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          CORE_POINTER_FIELD_UNIVERSAL_IDENTIFIER,
        ]),
      }),
    ).toEqual(['coreWorkflowId']);
  });

  it('selects nothing on any other object', () => {
    expect(
      getWorkflowCorePointerColumns({
        flatObjectMetadata: { nameSingular: 'company' },
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          CORE_POINTER_FIELD_UNIVERSAL_IDENTIFIER,
        ]),
      }),
    ).toEqual([]);
  });

  it('selects nothing when the workspace predates the mirror pointer field', () => {
    expect(
      getWorkflowCorePointerColumns({
        flatObjectMetadata: { nameSingular: 'workflow' },
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([]),
      }),
    ).toEqual([]);
  });
});
