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
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { isSystemSideEffectFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/is-system-side-effect-flat-entity.util';

type FlatEntityRow = {
  universalIdentifier: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
} & Record<string, unknown>;

type Classification = Pick<ApplicationExportCoverageEntry, 'status' | 'reason'>;

const FOREIGN_OWNED_PARENT_METADATA_NAMES = new Set<AllMetadataName>([
  'objectMetadata',
  'role',
  'view',
  'pageLayout',
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

const getRows = ({
  allFlatEntityMaps,
  metadataName,
}: {
  allFlatEntityMaps: AllFlatEntityMaps;
  metadataName: AllMetadataName;
}): FlatEntityRow[] =>
  (
    Object.values(
      allFlatEntityMaps[getMetadataFlatEntityMapsKey(metadataName)]
        .byUniversalIdentifier,
    ) as (FlatEntityRow | undefined)[]
  ).filter(isDefined);

const isEngineDerived = (row: FlatEntityRow): boolean =>
  isSystemSideEffectFlatEntity(
    row as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
  );

const isSoftDeleted = (row: FlatEntityRow): boolean => isDefined(row.deletedAt);

const classifyRow = ({
  metadataName,
  row,
}: {
  metadataName: AllMetadataName;
  row: FlatEntityRow;
}): Classification => {
  if (isEngineDerived(row)) {
    return { status: ApplicationExportCoverageStatus.ENGINE_DERIVED };
  }

  if (isSoftDeleted(row)) {
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
      return isDefined(row.userWorkspaceId) || isDefined(row.apiKeyId)
        ? {
            status: ApplicationExportCoverageStatus.EXCLUDED,
            reason: 'member or API key role assignment',
          }
        : { status: ApplicationExportCoverageStatus.UNSUPPORTED };
    case 'navigationMenuItem':
      return isDefined(row.userWorkspaceId) || isDefined(row.targetRecordId)
        ? {
            status: ApplicationExportCoverageStatus.EXCLUDED,
            reason: 'personal navigation item',
          }
        : { status: ApplicationExportCoverageStatus.UNSUPPORTED };
    case 'commandMenuItem':
      if (isDefined(row.workflowVersionId)) {
        return {
          status: ApplicationExportCoverageStatus.EXCLUDED,
          reason: 'workflow trigger command',
        };
      }

      return isDefined(row.frontComponentUniversalIdentifier)
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
  flatApplication: FlatApplication;
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
    for (const row of getRows({
      allFlatEntityMaps: applicationAllFlatEntityMaps,
      metadataName,
    })) {
      if (coveredKeys.has(`${metadataName}:${row.universalIdentifier}`)) {
        continue;
      }

      coverage.push({
        metadataName,
        universalIdentifier: row.universalIdentifier,
        ...classifyRow({ metadataName, row }),
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

    for (const row of getRows({ allFlatEntityMaps, metadataName })) {
      const parentUniversalIdentifier = row[parentProperty];
      const key = `${metadataName}:${row.universalIdentifier}`;

      if (
        row.applicationId === flatApplication.id ||
        isEngineDerived(row) ||
        isSoftDeleted(row) ||
        typeof parentUniversalIdentifier !== 'string' ||
        !isDefined(parentByUniversalIdentifier[parentUniversalIdentifier]) ||
        foreignOwnedKeys.has(key)
      ) {
        continue;
      }

      foreignOwnedKeys.add(key);
      coverage.push({
        metadataName,
        universalIdentifier: row.universalIdentifier,
        status: ApplicationExportCoverageStatus.FOREIGN_OWNED,
        reason: `owned by application ${row.applicationUniversalIdentifier}`,
      });
    }
  }

  return coverage.sort(compareCoverageEntries);
};
