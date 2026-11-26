import { isNonEmptyString } from '@sniptt/guards';
import { expressionNodeSchema } from 'twenty-shared/expression';
import {
  isDefined,
  parseExpressionNode,
  renameValidationRuleExpressionToCurrentFieldNames,
  resolveExpressionFieldReferences,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';

// Bindings lead the text back to the current field names; a rule whose text no longer parses keeps it and is turned off
export const buildValidationRuleTreeConversions = ({
  flatValidationRules,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatValidationRules: FlatValidationRule[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  flatValidationRulesToUpdate: FlatValidationRule[];
  unparsableValidationRuleIds: string[];
} => {
  const flatValidationRulesToUpdate: FlatValidationRule[] = [];
  const unparsableValidationRuleIds: string[] = [];

  for (const flatValidationRule of flatValidationRules) {
    const { expression, bindings, objectMetadataId } = flatValidationRule;

    if (
      !isDefined(expression) ||
      expressionNodeSchema.safeParse(flatValidationRule.tree).success
    ) {
      continue;
    }

    if (!isNonEmptyString(expression.trim())) {
      flatValidationRulesToUpdate.push({
        ...flatValidationRule,
        expression: null,
        bindings: {},
        tree: null,
      });
      continue;
    }

    const fields = buildValidationRuleFieldDescriptors({
      objectMetadataId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      shouldIncludeInactiveFields: true,
    });
    const parsing = parseExpressionNode(
      renameValidationRuleExpressionToCurrentFieldNames({
        expression,
        bindings,
        fields,
      }),
    );

    if (!parsing.isValid) {
      unparsableValidationRuleIds.push(flatValidationRule.id);

      if (flatValidationRule.isActive) {
        flatValidationRulesToUpdate.push({
          ...flatValidationRule,
          isActive: false,
        });
      }
      continue;
    }

    flatValidationRulesToUpdate.push({
      ...flatValidationRule,
      expression: null,
      bindings: {},
      tree: resolveExpressionFieldReferences({ node: parsing.node, fields }),
    });
  }

  return { flatValidationRulesToUpdate, unparsableValidationRuleIds };
};
