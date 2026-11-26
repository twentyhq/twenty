/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import { type ValidationRuleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatValidationRuleToValidationRuleManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-validation-rule-to-validation-rule-manifest.util';
import { fromValidationRuleManifestToUniversalFlatValidationRule } from 'src/engine/core-modules/application/application-manifest/converters/from-validation-rule-manifest-to-universal-flat-validation-rule.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { getUnresolvableReferenceReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unresolvable-reference-reason.util';
import { getUnreproducedPropertiesReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unreproduced-properties-reason.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { listValidationRuleReadFieldUniversalIdentifiers } from 'src/engine/metadata-modules/validation-rule/utils/list-validation-rule-read-field-universal-identifiers.util';
import { printFlatValidationRuleExpression } from 'src/engine/metadata-modules/validation-rule/utils/print-flat-validation-rule-expression.util';

const convertFlatValidationRule = ({
  flatValidationRule,
  allFlatEntityMaps,
}: {
  flatValidationRule: FlatValidationRule;
  allFlatEntityMaps: AllFlatEntityMaps;
}): { manifest: ValidationRuleManifest } | { reason: string } => {
  const expression = printFlatValidationRuleExpression({
    flatValidationRule,
    flatObjectMetadataMaps: allFlatEntityMaps.flatObjectMetadataMaps,
    flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
  });

  if (
    !isNonEmptyString(expression.trim()) ||
    !isNonEmptyString(flatValidationRule.message.trim())
  ) {
    return {
      reason:
        'The rule has no expression or message yet, so it cannot be written as a definition.',
    };
  }

  const manifest = fromFlatValidationRuleToValidationRuleManifest({
    flatValidationRule,
    expression,
  });
  const reason = getUnreproducedPropertiesReason({
    metadataName: 'validationRule',
    flatEntity: flatValidationRule,
    reproducedUniversalFlatEntity:
      fromValidationRuleManifestToUniversalFlatValidationRule({
        validationRuleManifest: manifest,
        tree: flatValidationRule.tree,
        // A sync keeps both of these from the workspace, so a definition never carries them
        isActive: flatValidationRule.isActive,
        applicationUniversalIdentifier:
          flatValidationRule.applicationUniversalIdentifier,
        now: flatValidationRule.updatedAt,
      }),
  });

  return isDefined(reason) ? { reason } : { manifest };
};

// Deleting a field keeps it in the tree and turns the rule off, but the pulled expression would not compile
const getDeletedReadFieldReason = ({
  flatValidationRule,
  allFlatEntityMaps,
}: {
  flatValidationRule: FlatValidationRule;
  allFlatEntityMaps: AllFlatEntityMaps;
}): string | undefined =>
  listValidationRuleReadFieldUniversalIdentifiers(flatValidationRule).some(
    (fieldUniversalIdentifier) =>
      !isDefined(
        allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          fieldUniversalIdentifier
        ],
      ),
  )
    ? 'The rule reads a field that no longer exists in this workspace.'
    : undefined;

export const reconstructValidationRulesManifest = ({
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
  resolvableFieldUniversalIdentifiers,
}: {
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
  resolvableFieldUniversalIdentifiers: ReadonlySet<string>;
}): {
  validationRules: ValidationRuleManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const validationRules: ValidationRuleManifest[] = [];
  const coverage: ApplicationExportCoverageEntry[] = [];

  for (const flatValidationRule of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatValidationRuleMaps,
  )) {
    const conversion = convertFlatValidationRule({
      flatValidationRule,
      allFlatEntityMaps,
    });
    const reason =
      getUnresolvableReferenceReason({
        metadataName: 'validationRule',
        referenceMetadataName: 'objectMetadata',
        referenceUniversalIdentifier:
          flatValidationRule.objectMetadataUniversalIdentifier,
        applicationAllFlatEntityMaps,
        allFlatEntityMaps,
        resolvableReferenceUniversalIdentifiers:
          exportedObjectUniversalIdentifiers,
      }) ??
      getUnresolvableReferenceReason({
        metadataName: 'validationRule',
        referenceMetadataName: 'fieldMetadata',
        referenceUniversalIdentifier:
          flatValidationRule.errorFieldMetadataUniversalIdentifier,
        applicationAllFlatEntityMaps,
        allFlatEntityMaps,
        resolvableReferenceUniversalIdentifiers:
          resolvableFieldUniversalIdentifiers,
      }) ??
      getDeletedReadFieldReason({ flatValidationRule, allFlatEntityMaps }) ??
      ('reason' in conversion ? conversion.reason : undefined);

    if (isDefined(reason) || 'reason' in conversion) {
      coverage.push({
        metadataName: 'validationRule',
        universalIdentifier: flatValidationRule.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason,
      });
      continue;
    }

    coverage.push(
      buildExportedCoverageEntry({
        metadataName: 'validationRule',
        flatEntity: flatValidationRule,
      }),
    );
    validationRules.push(conversion.manifest);
  }

  return { validationRules, coverage };
};
