import { type SkillManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromFlatSkillToSkillManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-skill-to-skill-manifest.util';
import { fromSkillManifestToUniversalFlatSkill } from 'src/engine/core-modules/application/application-manifest/converters/from-skill-manifest-to-universal-flat-skill.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { getUnreproducedPropertiesReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unreproduced-properties-reason.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

const convertFlatSkill = (
  flatSkill: FlatSkill,
): { manifest: SkillManifest } | { reason: string } => {
  if (flatSkill.isCustom) {
    return { reason: 'skill created in the workspace' };
  }

  // A skill has no overrides, so apply would reactivate it
  if (!flatSkill.isActive) {
    return { reason: 'skill deactivated in this workspace' };
  }

  const manifest = fromFlatSkillToSkillManifest({ flatSkill });
  const reason = getUnreproducedPropertiesReason({
    metadataName: 'skill',
    flatEntity: flatSkill,
    reproducedUniversalFlatEntity: fromSkillManifestToUniversalFlatSkill({
      skillManifest: manifest,
      applicationUniversalIdentifier: flatSkill.applicationUniversalIdentifier,
      now: flatSkill.updatedAt,
    }),
  });

  return isDefined(reason) ? { reason } : { manifest };
};

export const reconstructSkillsManifest = ({
  applicationAllFlatEntityMaps,
}: {
  applicationAllFlatEntityMaps: Pick<AllFlatEntityMaps, 'flatSkillMaps'>;
}): {
  skills: SkillManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const skills: SkillManifest[] = [];
  const coverage: ApplicationExportCoverageEntry[] = [];

  for (const flatSkill of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatSkillMaps,
  )) {
    const conversion = convertFlatSkill(flatSkill);

    if ('reason' in conversion) {
      coverage.push({
        metadataName: 'skill',
        universalIdentifier: flatSkill.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: conversion.reason,
      });
      continue;
    }

    coverage.push(
      buildExportedCoverageEntry({
        metadataName: 'skill',
        flatEntity: flatSkill,
      }),
    );
    skills.push(conversion.manifest);
  }

  return { skills, coverage };
};
