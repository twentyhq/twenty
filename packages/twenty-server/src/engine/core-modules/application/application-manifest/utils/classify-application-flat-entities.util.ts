import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { isSystemSideEffectFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/is-system-side-effect-flat-entity.util';

type ApplicationFlatEntity = MetadataFlatEntity<AllMetadataName>;

type Classification = Pick<ApplicationExportCoverageEntry, 'status' | 'reason'>;

const FOREIGN_OWNED_PARENT_METADATA_NAMES = new Set<AllMetadataName>([
  'objectMetadata',
  'role',
  'view',
  'pageLayout',
  'pageLayoutTab',
]);

const FOREIGN_OWNED_PARENT_REFERENCES: {
  metadataName: AllMetadataName;
  parentProperty: string;
  parentMetadataName: AllMetadataName;
}[] = Object.values(ALL_METADATA_NAME).flatMap((metadataName) =>
  Object.values(ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName])
    .filter(isDefined)
    .filter((relation) =>
      FOREIGN_OWNED_PARENT_METADATA_NAMES.has(relation.metadataName),
    )
    .map((relation) => ({
      metadataName,
      parentProperty: relation.universalForeignKey,
      parentMetadataName: relation.metadataName,
    })),
);

const getFlatEntities = ({
  allFlatEntityMaps,
  metadataName,
}: {
  allFlatEntityMaps: AllFlatEntityMaps;
  metadataName: AllMetadataName;
}): ApplicationFlatEntity[] =>
  Object.values(
    allFlatEntityMaps[getMetadataFlatEntityMapsKey(metadataName)]
      .byUniversalIdentifier,
  ).filter(isDefined);

const isSoftDeleted = (flatEntity: ApplicationFlatEntity): boolean =>
  'deletedAt' in flatEntity && isDefined(flatEntity.deletedAt);

const readParentUniversalIdentifier = ({
  flatEntity,
  parentProperty,
}: {
  flatEntity: ApplicationFlatEntity;
  parentProperty: string;
}): string | undefined => {
  const value = Object.entries(flatEntity).find(
    ([property]) => property === parentProperty,
  )?.[1];

  return typeof value === 'string' ? value : undefined;
};

const classifyFlatEntity = ({
  metadataName,
  flatEntity,
}: {
  metadataName: AllMetadataName;
  flatEntity: ApplicationFlatEntity;
}): Classification => {
  if (isSystemSideEffectFlatEntity(flatEntity)) {
    return { status: ApplicationExportCoverageStatus.ENGINE_DERIVED };
  }

  if (isSoftDeleted(flatEntity)) {
    return {
      status: ApplicationExportCoverageStatus.EXCLUDED,
      reason: 'soft-deleted',
    };
  }

  switch (metadataName) {
    case 'webhook':
      return {
        status: ApplicationExportCoverageStatus.EXCLUDED,
        reason: 'runtime configuration',
      };
    case 'searchFieldMetadata':
      return { status: ApplicationExportCoverageStatus.ENGINE_DERIVED };
    case 'roleTarget':
      return ('userWorkspaceId' in flatEntity &&
        isDefined(flatEntity.userWorkspaceId)) ||
        ('apiKeyId' in flatEntity && isDefined(flatEntity.apiKeyId))
        ? {
            status: ApplicationExportCoverageStatus.EXCLUDED,
            reason: 'member or API key role assignment',
          }
        : { status: ApplicationExportCoverageStatus.UNSUPPORTED };
    case 'navigationMenuItem':
      return ('userWorkspaceId' in flatEntity &&
        isDefined(flatEntity.userWorkspaceId)) ||
        ('targetRecordId' in flatEntity && isDefined(flatEntity.targetRecordId))
        ? {
            status: ApplicationExportCoverageStatus.EXCLUDED,
            reason: 'personal navigation item',
          }
        : { status: ApplicationExportCoverageStatus.UNSUPPORTED };
    case 'commandMenuItem':
      if (
        'workflowVersionId' in flatEntity &&
        isDefined(flatEntity.workflowVersionId)
      ) {
        return {
          status: ApplicationExportCoverageStatus.EXCLUDED,
          reason: 'workflow trigger command',
        };
      }

      return 'frontComponentUniversalIdentifier' in flatEntity &&
        isDefined(flatEntity.frontComponentUniversalIdentifier)
        ? { status: ApplicationExportCoverageStatus.UNSUPPORTED }
        : {
            status: ApplicationExportCoverageStatus.EXCLUDED,
            reason: 'command without front component',
          };
    default:
      return { status: ApplicationExportCoverageStatus.UNSUPPORTED };
  }
};

const compareCoverageEntries = (
  left: ApplicationExportCoverageEntry,
  right: ApplicationExportCoverageEntry,
): number =>
  left.metadataName.localeCompare(right.metadataName) ||
  left.status.localeCompare(right.status) ||
  left.universalIdentifier.localeCompare(right.universalIdentifier);

export const classifyApplicationFlatEntities = ({
  flatApplication,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  reconstructedCoverage,
}: {
  flatApplication: Pick<FlatApplication, 'id'>;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  reconstructedCoverage: ApplicationExportCoverageEntry[];
}): ApplicationExportCoverageEntry[] => {
  const coveredKeys = new Set(
    reconstructedCoverage.map(
      ({ metadataName, universalIdentifier }) =>
        `${metadataName}:${universalIdentifier}`,
    ),
  );
  const coverage = [...reconstructedCoverage];

  for (const metadataName of Object.values(ALL_METADATA_NAME)) {
    for (const flatEntity of getFlatEntities({
      allFlatEntityMaps: applicationAllFlatEntityMaps,
      metadataName,
    })) {
      if (
        coveredKeys.has(`${metadataName}:${flatEntity.universalIdentifier}`)
      ) {
        continue;
      }

      coverage.push({
        metadataName,
        universalIdentifier: flatEntity.universalIdentifier,
        ...classifyFlatEntity({ metadataName, flatEntity }),
      });
    }
  }

  const foreignOwnedKeys = new Set<string>();

  for (const {
    metadataName,
    parentProperty,
    parentMetadataName,
  } of FOREIGN_OWNED_PARENT_REFERENCES) {
    const parentByUniversalIdentifier =
      applicationAllFlatEntityMaps[
        getMetadataFlatEntityMapsKey(parentMetadataName)
      ].byUniversalIdentifier;

    for (const flatEntity of getFlatEntities({
      allFlatEntityMaps,
      metadataName,
    })) {
      const parentUniversalIdentifier = readParentUniversalIdentifier({
        flatEntity,
        parentProperty,
      });
      const key = `${metadataName}:${flatEntity.universalIdentifier}`;

      if (
        flatEntity.applicationId === flatApplication.id ||
        isSystemSideEffectFlatEntity(flatEntity) ||
        isSoftDeleted(flatEntity) ||
        !isDefined(parentUniversalIdentifier) ||
        !isDefined(parentByUniversalIdentifier[parentUniversalIdentifier]) ||
        foreignOwnedKeys.has(key)
      ) {
        continue;
      }

      foreignOwnedKeys.add(key);
      coverage.push({
        metadataName,
        universalIdentifier: flatEntity.universalIdentifier,
        status: ApplicationExportCoverageStatus.FOREIGN_OWNED,
        reason: `owned by application ${flatEntity.applicationUniversalIdentifier}`,
      });
    }
  }

  return coverage.sort(compareCoverageEntries);
};
