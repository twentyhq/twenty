/* @license Enterprise */

import { type ValidationRuleManifest } from 'twenty-shared/application';
import { type ValidationRuleBindings } from 'twenty-shared/types';

import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';

export const fromValidationRuleManifestToUniversalFlatValidationRule = ({
  validationRuleManifest,
  bindings,
  isActive,
  applicationUniversalIdentifier,
  now,
}: {
  validationRuleManifest: ValidationRuleManifest;
  bindings: ValidationRuleBindings;
  isActive: boolean;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatValidationRule => ({
  universalIdentifier: validationRuleManifest.universalIdentifier,
  applicationUniversalIdentifier,
  objectMetadataUniversalIdentifier:
    validationRuleManifest.objectUniversalIdentifier,
  errorFieldMetadataUniversalIdentifier:
    validationRuleManifest.errorFieldUniversalIdentifier ?? null,
  name: validationRuleManifest.name.trim(),
  description: validationRuleManifest.description ?? null,
  icon: validationRuleManifest.icon ?? null,
  expression: validationRuleManifest.expression,
  bindings,
  message: validationRuleManifest.message.trim(),
  isActive,
  createdAt: now,
  updatedAt: now,
});
