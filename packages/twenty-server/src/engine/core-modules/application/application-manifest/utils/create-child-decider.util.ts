import { isDefined } from 'twenty-shared/utils';

import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import {
  type ChildMetadataName,
  type ParentMetadataName,
  type ParentStatus,
} from 'src/engine/core-modules/application/application-manifest/types/export-classification.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { getParentReason } from 'src/engine/core-modules/application/application-manifest/utils/get-parent-reason.util';
import { type WorkspaceLocalStateProperties } from 'src/engine/core-modules/application/application-manifest/utils/get-workspace-local-state-reason.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';

export type FlatChild = {
  universalIdentifier: string;
} & Partial<WorkspaceLocalStateProperties>;

export type ChildDecision = 'nested' | 'standalone';

export const createChildDecider =
  <TFlatChild extends FlatChild>({
    coverage,
    parentMetadataName,
    parentStatusByUniversalIdentifier,
    getParentUniversalIdentifier,
  }: {
    coverage: ApplicationExportCoverageEntry[];
    parentMetadataName: ParentMetadataName;
    parentStatusByUniversalIdentifier: ReadonlyMap<string, ParentStatus>;
    getParentUniversalIdentifier: (flatEntity: TFlatChild) => string;
  }) =>
  ({
    metadataName,
    flatEntity,
    isEngineDerived = false,
    unsupportedReason,
    canStandAlone = false,
  }: {
    metadataName: ChildMetadataName;
    flatEntity: TFlatChild;
    isEngineDerived?: boolean;
    unsupportedReason?: string;
    canStandAlone?: boolean;
  }): ChildDecision | undefined => {
    if (isEngineDerived) {
      coverage.push({
        metadataName,
        universalIdentifier: flatEntity.universalIdentifier,
        status: ApplicationExportCoverageStatus.ENGINE_DERIVED,
      });

      return undefined;
    }

    const parentStatus =
      parentStatusByUniversalIdentifier.get(
        getParentUniversalIdentifier(flatEntity),
      ) ?? 'outside';

    if (
      parentStatus !== 'exported' &&
      (parentStatus === 'unsupported' || !canStandAlone)
    ) {
      coverage.push({
        metadataName,
        universalIdentifier: flatEntity.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: getParentReason({
          metadataName,
          parentMetadataName,
          parentStatus,
        }),
      });

      return undefined;
    }

    if (isDefined(unsupportedReason)) {
      coverage.push({
        metadataName,
        universalIdentifier: flatEntity.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: unsupportedReason,
      });

      return undefined;
    }

    coverage.push(buildExportedCoverageEntry({ metadataName, flatEntity }));

    return parentStatus === 'exported' ? 'nested' : 'standalone';
  };
