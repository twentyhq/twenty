import { isNonEmptyString } from '@sniptt/guards';
import { expressionNodeSchema } from 'twenty-shared/expression';
import { type ValidationRuleBindings } from 'twenty-shared/types';
import {
  isDefined,
  parseExpressionNode,
  resolveExpressionFieldReferences,
} from 'twenty-shared/utils';

import { renameLegacyExpressionToCurrentFieldNames } from 'src/database/commands/upgrade-version-command/2-65/utils/rename-legacy-expression-to-current-field-names.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';

export type LegacyValidationRuleText = {
  expression: string;
  bindings: ValidationRuleBindings;
};

export const buildValidationRuleTreeConversions = ({
  flatValidationRules,
  legacyValidationRuleTextById,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatValidationRules: FlatValidationRule[];
  legacyValidationRuleTextById: Map<string, LegacyValidationRuleText>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  flatValidationRulesToUpdate: FlatValidationRule[];
  unparsableValidationRuleIds: string[];
} => {
  const flatValidationRulesToUpdate: FlatValidationRule[] = [];
  const unparsableValidationRuleIds: string[] = [];

  for (const flatValidationRule of flatValidationRules) {
    const legacyValidationRuleText = legacyValidationRuleTextById.get(
      flatValidationRule.id,
    );

    if (
      !isDefined(legacyValidationRuleText) ||
      expressionNodeSchema.safeParse(flatValidationRule.tree).success
    ) {
      continue;
    }

    const { expression, bindings } = legacyValidationRuleText;

    if (!isNonEmptyString(expression.trim())) {
      continue;
    }

    const fields = buildValidationRuleFieldDescriptors({
      objectMetadataId: flatValidationRule.objectMetadataId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      shouldIncludeInactiveFields: true,
    });
    const parsing = parseExpressionNode(
      renameLegacyExpressionToCurrentFieldNames({
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
      tree: resolveExpressionFieldReferences({ node: parsing.node, fields }),
    });
  }

  return { flatValidationRulesToUpdate, unparsableValidationRuleIds };
};
