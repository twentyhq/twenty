import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileFormulaExpression,
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  getFieldMetadataFormulaTree,
  isDefined,
  isPlainObject,
  parseExpressionNode,
  renameValidationRuleExpressionToCurrentFieldNames,
  resolveExpressionFieldReferences,
} from 'twenty-shared/utils';

import { getLegacyFormulaFieldBindings } from 'src/database/commands/upgrade-version-command/2-65/utils/get-legacy-formula-field-bindings.util';
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
  const currentExpression = renameValidationRuleExpressionToCurrentFieldNames({
    expression,
    bindings,
    fields,
  });
  const parsing = parseExpressionNode(currentExpression);

  return parsing.isValid &&
    compileFormulaExpression({ expression: currentExpression, fields }).isValid
    ? resolveExpressionFieldReferences({ node: parsing.node, fields })
    : undefined;
};

// Bindings lead the text back to the current field names; a formula that no longer compiles keeps its text, which is still read
export const buildFormulaFieldTreeConversions = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  flatFieldMetadatasToUpdate: FlatFieldMetadata[];
  textFormulaFieldNames: string[];
} => {
  const flatFieldMetadatasToUpdate: FlatFieldMetadata[] = [];
  const textFormulaFieldNames: string[] = [];

  for (const flatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const { universalSettings, name } = flatFieldMetadata;
    const expression = getFieldMetadataFormulaExpression({
      settings: universalSettings,
    });

    if (
      !isDefined(expression) ||
      !isDefined(universalSettings) ||
      isDefined(getFieldMetadataFormulaTree({ settings: universalSettings }))
    ) {
      continue;
    }

    const currencyCodeExpression =
      getFieldMetadataFormulaCurrencyCodeExpression({
        settings: universalSettings,
      });
    const universalFlatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.objectMetadataUniversalIdentifier
      ];
    const fields = isDefined(universalFlatObjectMetadata)
      ? buildFormulaFieldDescriptorsFromUniversalFlatEntityMaps({
          universalFlatObjectMetadata,
          universalFlatObjectMetadataMaps: flatObjectMetadataMaps,
          universalFlatFieldMetadataMaps: flatFieldMetadataMaps,
        }).filter((formulaFieldDescriptor) => formulaFieldDescriptor.name !== name)
      : [];
    const bindings = getLegacyFormulaFieldBindings({
      settings: universalSettings,
    });
    const tree = buildTree({ expression, bindings, fields });
    const currencyCodeTree = isDefined(currencyCodeExpression)
      ? buildTree({ expression: currencyCodeExpression, bindings, fields })
      : undefined;

    if (
      !isDefined(tree) ||
      (isDefined(currencyCodeExpression) && !isDefined(currencyCodeTree))
    ) {
      textFormulaFieldNames.push(name);
      continue;
    }

    const storedEvaluation =
      'formula' in universalSettings && isPlainObject(universalSettings.formula)
        ? universalSettings.formula.evaluation
        : undefined;
    const settings = {
      ...universalSettings,
      formula: {
        tree,
        ...(isDefined(currencyCodeTree) ? { currencyCodeTree } : {}),
        ...(isDefined(storedEvaluation) ? { evaluation: storedEvaluation } : {}),
      },
    };

    flatFieldMetadatasToUpdate.push({
      ...flatFieldMetadata,
      settings,
      universalSettings: settings,
    });
  }

  return { flatFieldMetadatasToUpdate, textFormulaFieldNames };
};
