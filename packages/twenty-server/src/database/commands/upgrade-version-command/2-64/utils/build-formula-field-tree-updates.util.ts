import {
  getFieldMetadataFormulaExpression,
  getFieldMetadataFormulaTree,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { setFormulaFieldTrees } from 'src/engine/metadata-modules/formula-field/utils/set-formula-field-trees.util';

// A formula that no longer compiles stays as text, which is still read, so the upgrade never fails a workspace
export const buildFormulaFieldTreeUpdates = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): { flatFieldMetadatasToUpdate: FlatFieldMetadata[]; textFormulaFieldNames: string[] } => {
  const textFormulaFlatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      ({ universalSettings }) =>
        isDefined(
          getFieldMetadataFormulaExpression({ settings: universalSettings }),
        ) &&
        !isDefined(getFieldMetadataFormulaTree({ settings: universalSettings })),
    );

  const convertedFlatFieldMetadatas = textFormulaFlatFieldMetadatas.map(
    (flatFieldMetadata) =>
      setFormulaFieldTrees({
        universalFlatFieldMetadata: flatFieldMetadata,
        universalFlatObjectMetadataMaps: flatObjectMetadataMaps,
        universalFlatFieldMetadataMaps: flatFieldMetadataMaps,
      }),
  );

  const isConverted = ({ universalSettings }: FlatFieldMetadata) =>
    isDefined(getFieldMetadataFormulaTree({ settings: universalSettings }));

  return {
    flatFieldMetadatasToUpdate: convertedFlatFieldMetadatas
      .filter(isConverted)
      .map((flatFieldMetadata) => ({
        ...flatFieldMetadata,
        settings: flatFieldMetadata.universalSettings,
      })),
    textFormulaFieldNames: convertedFlatFieldMetadatas
      .filter((flatFieldMetadata) => !isConverted(flatFieldMetadata))
      .map(({ name }) => name),
  };
};
