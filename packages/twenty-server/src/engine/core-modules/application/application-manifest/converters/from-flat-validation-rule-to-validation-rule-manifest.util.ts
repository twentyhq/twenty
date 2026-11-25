/* @license Enterprise */

import { type ValidationRuleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';

export const fromFlatValidationRuleToValidationRuleManifest = ({
  flatValidationRule,
}: {
  flatValidationRule: Pick<
    FlatValidationRule,
    | 'universalIdentifier'
    | 'objectMetadataUniversalIdentifier'
    | 'name'
    | 'expression'
    | 'message'
    | 'description'
    | 'icon'
    | 'errorFieldMetadataUniversalIdentifier'
  >;
}): ValidationRuleManifest => ({
  universalIdentifier: flatValidationRule.universalIdentifier,
  objectUniversalIdentifier:
    flatValidationRule.objectMetadataUniversalIdentifier,
  name: flatValidationRule.name,
  expression: flatValidationRule.expression,
  message: flatValidationRule.message,
  ...(isDefined(flatValidationRule.description)
    ? { description: flatValidationRule.description }
    : {}),
  ...(isDefined(flatValidationRule.icon)
    ? { icon: flatValidationRule.icon }
    : {}),
  ...(isDefined(flatValidationRule.errorFieldMetadataUniversalIdentifier)
    ? {
        errorFieldUniversalIdentifier:
          flatValidationRule.errorFieldMetadataUniversalIdentifier,
      }
    : {}),
});
