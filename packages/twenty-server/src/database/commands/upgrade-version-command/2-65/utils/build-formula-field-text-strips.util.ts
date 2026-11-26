import {
  getFieldMetadataFormulaTree,
  isDefined,
  isPlainObject,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const LEGACY_FORMULA_KEYS = [
  'expression',
  'currencyCodeExpression',
  'bindings',
] as const;

const isLegacyFormulaKey = (key: string) =>
  LEGACY_FORMULA_KEYS.some((legacyKey) => legacyKey === key);

// A formula 2-64 could not give a tree keeps its text, so it is reported rather than emptied
export const buildFormulaFieldTextStrips = ({
  flatFieldMetadataMaps,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  flatFieldMetadatasToUpdate: FlatFieldMetadata[];
  treelessFormulaFieldNames: string[];
} => {
  const flatFieldMetadatasToUpdate: FlatFieldMetadata[] = [];
  const treelessFormulaFieldNames: string[] = [];

  for (const flatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const { universalSettings, name } = flatFieldMetadata;

    if (
      !isDefined(universalSettings) ||
      !('formula' in universalSettings) ||
      !isPlainObject(universalSettings.formula)
    ) {
      continue;
    }

    const storedFormula = universalSettings.formula;
    const hasLegacyText = Object.keys(storedFormula).some(isLegacyFormulaKey);

    if (!hasLegacyText) {
      continue;
    }

    if (
      !isDefined(getFieldMetadataFormulaTree({ settings: universalSettings }))
    ) {
      treelessFormulaFieldNames.push(name);
      continue;
    }

    const settings = {
      ...universalSettings,
      formula: Object.fromEntries(
        Object.entries(storedFormula).filter(([key]) => !isLegacyFormulaKey(key)),
      ),
    };

    flatFieldMetadatasToUpdate.push({
      ...flatFieldMetadata,
      settings,
      universalSettings: settings,
    });
  }

  return { flatFieldMetadatasToUpdate, treelessFormulaFieldNames };
};
