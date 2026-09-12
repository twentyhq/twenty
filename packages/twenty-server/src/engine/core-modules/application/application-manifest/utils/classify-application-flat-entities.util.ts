import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { compareByCodePoint } from 'src/engine/core-modules/application/application-manifest/utils/compare-by-code-point.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { isSystemSideEffectFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/is-system-side-effect-flat-entity.util';

type ApplicationFlatEntity = MetadataFlatEntity<AllMetadataName>;

type Classification = Pick<ApplicationExportCoverageEntry, 'status' | 'reason'>;

type ClassificationContext = {
  flatApplication: Pick<FlatApplication, 'id'>;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
};

type ContainedFlatEntityScan = (
  context: ClassificationContext,
) => ApplicationExportCoverageEntry[];

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

const classifyContainedFlatEntity = ({
  metadataName,
  flatEntity,
}: {
  metadataName: AllMetadataName;
  flatEntity: ApplicationFlatEntity;
}): Classification | undefined => {
  const classification = classifyFlatEntity({ metadataName, flatEntity });

  if (
    classification.status === ApplicationExportCoverageStatus.ENGINE_DERIVED
  ) {
    return undefined;
  }

  return classification.status === ApplicationExportCoverageStatus.EXCLUDED
    ? classification
    : {
        status: ApplicationExportCoverageStatus.FOREIGN_OWNED,
        reason: `owned by application ${flatEntity.applicationUniversalIdentifier}`,
      };
};

const buildContainedFlatEntityScan =
  <TMetadataName extends AllMetadataName>({
    metadataName,
    selectFlatEntityMaps,
    containerMetadataName,
    containerUniversalForeignKey,
  }: {
    metadataName: TMetadataName;
    selectFlatEntityMaps: (
      allFlatEntityMaps: AllFlatEntityMaps,
    ) => MetadataFlatEntityMaps<TMetadataName>;
    containerMetadataName: AllMetadataName;
    containerUniversalForeignKey: keyof MetadataFlatEntity<TMetadataName> &
      string;
  }): ContainedFlatEntityScan =>
  ({ flatApplication, applicationAllFlatEntityMaps, allFlatEntityMaps }) => {
    const containerByUniversalIdentifier =
      applicationAllFlatEntityMaps[
        getMetadataFlatEntityMapsKey(containerMetadataName)
      ].byUniversalIdentifier;
    const entries: ApplicationExportCoverageEntry[] = [];

    for (const flatEntity of Object.values(
      selectFlatEntityMaps(allFlatEntityMaps).byUniversalIdentifier,
    ).filter(isDefined)) {
      const containerUniversalIdentifier =
        flatEntity[containerUniversalForeignKey];

      if (
        flatEntity.applicationId === flatApplication.id ||
        isSystemSideEffectFlatEntity(flatEntity) ||
        isSoftDeleted(flatEntity) ||
        typeof containerUniversalIdentifier !== 'string' ||
        !isDefined(containerByUniversalIdentifier[containerUniversalIdentifier])
      ) {
        continue;
      }

      const classification = classifyContainedFlatEntity({
        metadataName,
        flatEntity,
      });

      if (!isDefined(classification)) {
        continue;
      }

      entries.push({
        metadataName,
        universalIdentifier: flatEntity.universalIdentifier,
        ...classification,
      });
    }

    return entries;
  };

const CONTAINED_FLAT_ENTITY_SCANS: ContainedFlatEntityScan[] = [
  buildContainedFlatEntityScan({
    metadataName: 'fieldMetadata',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatFieldMetadataMaps,
    containerMetadataName: 'objectMetadata',
    containerUniversalForeignKey: 'objectMetadataUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'index',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatIndexMaps,
    containerMetadataName: 'objectMetadata',
    containerUniversalForeignKey: 'objectMetadataUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'view',
    selectFlatEntityMaps: (allFlatEntityMaps) => allFlatEntityMaps.flatViewMaps,
    containerMetadataName: 'objectMetadata',
    containerUniversalForeignKey: 'objectMetadataUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'pageLayout',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatPageLayoutMaps,
    containerMetadataName: 'objectMetadata',
    containerUniversalForeignKey: 'objectMetadataUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'viewField',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatViewFieldMaps,
    containerMetadataName: 'view',
    containerUniversalForeignKey: 'viewUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'viewFieldGroup',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatViewFieldGroupMaps,
    containerMetadataName: 'view',
    containerUniversalForeignKey: 'viewUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'viewFilter',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatViewFilterMaps,
    containerMetadataName: 'view',
    containerUniversalForeignKey: 'viewUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'viewFilterGroup',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatViewFilterGroupMaps,
    containerMetadataName: 'view',
    containerUniversalForeignKey: 'viewUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'viewGroup',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatViewGroupMaps,
    containerMetadataName: 'view',
    containerUniversalForeignKey: 'viewUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'viewSort',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatViewSortMaps,
    containerMetadataName: 'view',
    containerUniversalForeignKey: 'viewUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'pageLayoutTab',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatPageLayoutTabMaps,
    containerMetadataName: 'pageLayout',
    containerUniversalForeignKey: 'pageLayoutUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'pageLayoutWidget',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatPageLayoutWidgetMaps,
    containerMetadataName: 'pageLayoutTab',
    containerUniversalForeignKey: 'pageLayoutTabUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'roleTarget',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatRoleTargetMaps,
    containerMetadataName: 'role',
    containerUniversalForeignKey: 'roleUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'rolePermissionFlag',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatRolePermissionFlagMaps,
    containerMetadataName: 'role',
    containerUniversalForeignKey: 'roleUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'objectPermission',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatObjectPermissionMaps,
    containerMetadataName: 'role',
    containerUniversalForeignKey: 'roleUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'fieldPermission',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatFieldPermissionMaps,
    containerMetadataName: 'role',
    containerUniversalForeignKey: 'roleUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'rowLevelPermissionPredicate',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatRowLevelPermissionPredicateMaps,
    containerMetadataName: 'role',
    containerUniversalForeignKey: 'roleUniversalIdentifier',
  }),
  buildContainedFlatEntityScan({
    metadataName: 'rowLevelPermissionPredicateGroup',
    selectFlatEntityMaps: (allFlatEntityMaps) =>
      allFlatEntityMaps.flatRowLevelPermissionPredicateGroupMaps,
    containerMetadataName: 'role',
    containerUniversalForeignKey: 'roleUniversalIdentifier',
  }),
];

const compareCoverageEntries = (
  left: ApplicationExportCoverageEntry,
  right: ApplicationExportCoverageEntry,
): number =>
  compareByCodePoint(left.metadataName, right.metadataName) ||
  compareByCodePoint(left.status, right.status) ||
  compareByCodePoint(left.universalIdentifier, right.universalIdentifier);

export const classifyApplicationFlatEntities = ({
  flatApplication,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  reconstructedCoverage,
}: ClassificationContext & {
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

  const context = {
    flatApplication,
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
  };

  return [
    ...coverage,
    ...CONTAINED_FLAT_ENTITY_SCANS.flatMap((scan) => scan(context)),
  ].sort(compareCoverageEntries);
};
