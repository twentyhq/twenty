/* @license Enterprise */

import { type ValidationRuleManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatValidationRuleToValidationRuleManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-validation-rule-to-validation-rule-manifest.util';
import { fromValidationRuleManifestToUniversalFlatValidationRule } from 'src/engine/core-modules/application/application-manifest/converters/from-validation-rule-manifest-to-universal-flat-validation-rule.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { getUnreproducedPropertiesReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unreproduced-properties-reason.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';

const convertFlatValidationRule = (
  flatValidationRule: FlatValidationRule,
): { manifest: ValidationRuleManifest } | { reason: string } => {
  const manifest = fromFlatValidationRuleToValidationRuleManifest({
    flatValidationRule,
  });
  const reason = getUnreproducedPropertiesReason({
    metadataName: 'validationRule',
    flatEntity: flatValidationRule,
    reproducedUniversalFlatEntity:
      fromValidationRuleManifestToUniversalFlatValidationRule({
        validationRuleManifest: manifest,
        bindings: flatValidationRule.bindings,
        // A sync keeps both of these from the workspace, so a definition never carries them
        isActive: flatValidationRule.isActive,
        applicationUniversalIdentifier:
          flatValidationRule.applicationUniversalIdentifier,
        now: flatValidationRule.updatedAt,
      }),
  });

  return isDefined(reason) ? { reason } : { manifest };
};

export const reconstructValidationRulesManifest = ({
  applicationAllFlatEntityMaps,
}: {
  applicationAllFlatEntityMaps: Pick<
    AllFlatEntityMaps,
    'flatValidationRuleMaps'
  >;
}): {
  validationRules: ValidationRuleManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const validationRules: ValidationRuleManifest[] = [];
  const coverage: ApplicationExportCoverageEntry[] = [];

  for (const flatValidationRule of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatValidationRuleMaps,
  )) {
    const conversion = convertFlatValidationRule(flatValidationRule);

    if ('reason' in conversion) {
      coverage.push({
        metadataName: 'validationRule',
        universalIdentifier: flatValidationRule.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: conversion.reason,
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
