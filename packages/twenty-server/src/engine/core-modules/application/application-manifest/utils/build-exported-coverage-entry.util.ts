import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import {
  getWorkspaceLocalStateReason,
  type WorkspaceLocalStateProperties,
} from 'src/engine/core-modules/application/application-manifest/utils/get-workspace-local-state-reason.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';

export const buildExportedCoverageEntry = ({
  metadataName,
  flatEntity,
}: {
  metadataName: AllMetadataName;
  flatEntity: {
    universalIdentifier: string;
  } & Partial<WorkspaceLocalStateProperties>;
}): ApplicationExportCoverageEntry => {
  const reason = getWorkspaceLocalStateReason({ metadataName, ...flatEntity });

  return {
    metadataName,
    universalIdentifier: flatEntity.universalIdentifier,
    status: ApplicationExportCoverageStatus.EXPORTED,
    ...(isDefined(reason) ? { reason } : {}),
  };
};
