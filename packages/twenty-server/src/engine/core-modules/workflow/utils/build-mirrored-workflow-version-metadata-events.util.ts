import isEmpty from 'lodash.isempty';
import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-update.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';
import { deriveMetadataEventsFromCreateAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/derive-metadata-events-from-create-action.util';
import { deriveMetadataEventsFromUpdateAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/derive-metadata-events-from-update-action.util';

export const buildMirroredWorkflowVersionMetadataEvents = ({
  flatWorkflowVersionMapsBeforeWrite,
  flatWorkflowVersion,
}: {
  flatWorkflowVersionMapsBeforeWrite: AllFlatEntityMaps['flatWorkflowVersionMaps'];
  flatWorkflowVersion: FlatWorkflowVersion;
}): MetadataEvent[] => {
  const previousFlatWorkflowVersion = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: flatWorkflowVersion.id,
    flatEntityMaps: flatWorkflowVersionMapsBeforeWrite,
  });

  if (!isDefined(previousFlatWorkflowVersion)) {
    return deriveMetadataEventsFromCreateAction({
      type: 'create',
      metadataName: 'workflowVersion',
      flatEntity: flatWorkflowVersion,
    });
  }

  const update: FlatEntityUpdate<'workflowVersion'> = {
    ...(isEqual(previousFlatWorkflowVersion.status, flatWorkflowVersion.status)
      ? {}
      : { status: flatWorkflowVersion.status }),
    ...(isEqual(
      previousFlatWorkflowVersion.triggers,
      flatWorkflowVersion.triggers,
    )
      ? {}
      : { triggers: flatWorkflowVersion.triggers }),
    ...(isEqual(previousFlatWorkflowVersion.steps, flatWorkflowVersion.steps)
      ? {}
      : { steps: flatWorkflowVersion.steps }),
    ...(isEqual(
      previousFlatWorkflowVersion.coreWorkflowId,
      flatWorkflowVersion.coreWorkflowId,
    )
      ? {}
      : { coreWorkflowId: flatWorkflowVersion.coreWorkflowId }),
  };

  if (isEmpty(update)) {
    return [];
  }

  return deriveMetadataEventsFromUpdateAction({
    flatAction: {
      type: 'update',
      metadataName: 'workflowVersion',
      entityId: flatWorkflowVersion.id,
      update,
    },
    allFlatEntityMaps: {
      flatWorkflowVersionMaps: flatWorkflowVersionMapsBeforeWrite,
    } as AllFlatEntityMaps,
  });
};
