import { isDefined } from 'twenty-shared/utils';

import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import {
  type ParentViewStatus,
  type ViewChildMetadataName,
} from 'src/engine/core-modules/application/application-manifest/types/view-export-classification.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { getParentViewReason } from 'src/engine/core-modules/application/application-manifest/utils/get-parent-view-reason.util';
import { type WorkspaceLocalStateProperties } from 'src/engine/core-modules/application/application-manifest/utils/get-workspace-local-state-reason.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';

type FlatViewChild = {
  universalIdentifier: string;
  viewUniversalIdentifier: string;
} & Partial<WorkspaceLocalStateProperties>;

export type ViewChildDecision = 'nested' | 'standalone';

export const createViewChildDecider =
  ({
    coverage,
    parentViewStatusByUniversalIdentifier,
  }: {
    coverage: ApplicationExportCoverageEntry[];
    parentViewStatusByUniversalIdentifier: ReadonlyMap<
      string,
      ParentViewStatus
    >;
  }) =>
  ({
    metadataName,
    flatEntity,
    isEngineDerived = false,
    unsupportedReason,
    canStandAlone = false,
  }: {
    metadataName: ViewChildMetadataName;
    flatEntity: FlatViewChild;
    isEngineDerived?: boolean;
    unsupportedReason?: string;
    canStandAlone?: boolean;
  }): ViewChildDecision | undefined => {
    if (isEngineDerived) {
      coverage.push({
        metadataName,
        universalIdentifier: flatEntity.universalIdentifier,
        status: ApplicationExportCoverageStatus.ENGINE_DERIVED,
      });

      return undefined;
    }

    const parentViewStatus =
      parentViewStatusByUniversalIdentifier.get(
        flatEntity.viewUniversalIdentifier,
      ) ?? 'outside';

    if (
      parentViewStatus !== 'exported' &&
      (parentViewStatus === 'unsupported' || !canStandAlone)
    ) {
      coverage.push({
        metadataName,
        universalIdentifier: flatEntity.universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason: getParentViewReason({ metadataName, parentViewStatus }),
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

    return parentViewStatus === 'exported' ? 'nested' : 'standalone';
  };
