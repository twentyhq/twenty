import {
  getFieldMetadataFormulaBindings,
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  getFieldMetadataFormulaTree,
  isDefined,
  isPlainObject,
  parseExpressionNode,
  renameValidationRuleExpressionToCurrentFieldNames,
  resolveExpressionFieldReferences,
} from 'twenty-shared/utils';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-universal-flat-entity-maps.util';

const buildTree = ({
  expression,
  bindings,
  fields,
}: {
  expression: string;
  bindings: Record<string, string>;
  fields: ValidationRuleFieldDescriptor[];
}) => {
  const parsing = parseExpressionNode(
    renameValidationRuleExpressionToCurrentFieldNames({
      expression,
      bindings,
      fields,
    }),
  );

  return parsing.isValid
    ? resolveExpressionFieldReferences({ node: parsing.node, fields })
    : undefined;
};

// Text and bindings stay, as the 2.64 runtime still reads them; a formula that no longer parses keeps no tree
export const buildFormulaFieldTreeBackfill = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  flatFieldMetadatasToUpdate: FlatFieldMetadata[];
  unparsedFormulaFieldNames: string[];
} => {
  const flatFieldMetadatasToUpdate: FlatFieldMetadata[] = [];
  const unparsedFormulaFieldNames: string[] = [];

  for (const flatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const { universalSettings, name } = flatFieldMetadata;
    const expression = getFieldMetadataFormulaExpression({
      settings: universalSettings,
    });
    const currencyCodeExpression =
      getFieldMetadataFormulaCurrencyCodeExpression({
        settings: universalSettings,
      });
    const universalFlatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.objectMetadataUniversalIdentifier
      ];

    if (
      !isDefined(expression) ||
      !isDefined(universalSettings) ||
      isDefined(getFieldMetadataFormulaTree({ settings: universalSettings }))
    ) {
      continue;
    }

    const fields = isDefined(universalFlatObjectMetadata)
      ? buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps({
          universalFlatObjectMetadata,
          universalFlatObjectMetadataMaps: flatObjectMetadataMaps,
          universalFlatFieldMetadataMaps: flatFieldMetadataMaps,
        }).filter((formulaFieldDescriptor) => formulaFieldDescriptor.name !== name)
      : [];
    const bindings =
      getFieldMetadataFormulaBindings({ settings: universalSettings }) ?? {};
    const tree = buildTree({ expression, bindings, fields });
    const currencyCodeTree = isDefined(currencyCodeExpression)
      ? buildTree({ expression: currencyCodeExpression, bindings, fields })
      : undefined;

    if (
      !isDefined(tree) ||
      (isDefined(currencyCodeExpression) && !isDefined(currencyCodeTree))
    ) {
      unparsedFormulaFieldNames.push(name);
      continue;
    }

    const storedFormula =
      'formula' in universalSettings && isPlainObject(universalSettings.formula)
        ? universalSettings.formula
        : {};
    const settings = {
      ...universalSettings,
      formula: {
        ...storedFormula,
        tree,
        ...(isDefined(currencyCodeTree) ? { currencyCodeTree } : {}),
      },
    };

    flatFieldMetadatasToUpdate.push({
      ...flatFieldMetadata,
      settings,
      universalSettings: settings,
    });
  }

  return { flatFieldMetadatasToUpdate, unparsedFormulaFieldNames };
};
