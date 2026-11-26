/* @license Enterprise */

import { type ValidationRuleManifest } from 'twenty-shared/application';

import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';

export const fromValidationRuleManifestToUniversalFlatValidationRule = ({
  validationRuleManifest,
  tree,
  isActive,
  applicationUniversalIdentifier,
  now,
}: {
  validationRuleManifest: Omit<ValidationRuleManifest, 'expression'>;
  tree: UniversalFlatValidationRule['tree'];
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
  expression: null,
  bindings: {},
  tree,
  message: validationRuleManifest.message.trim(),
  isActive,
  createdAt: now,
  updatedAt: now,
});
