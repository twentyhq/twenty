import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';

import { ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';
import { deriveMetadataEventsFromCreateAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/derive-metadata-events-from-create-action.util';
import { buildUpdateMetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/derive-metadata-events-from-update-action.util';

export const buildMirroredWorkflowVersionMetadataEvents = ({
  previousFlatWorkflowVersion,
  flatWorkflowVersion,
}: {
  previousFlatWorkflowVersion: FlatWorkflowVersion | undefined;
  flatWorkflowVersion: FlatWorkflowVersion;
}): MetadataEvent[] => {
  if (!isDefined(previousFlatWorkflowVersion)) {
    return deriveMetadataEventsFromCreateAction({
      type: 'create',
      metadataName: 'workflowVersion',
      flatEntity: flatWorkflowVersion,
    });
  }

  const updatedFields =
    ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY.workflowVersion.propertiesToCompare.filter(
      (property) =>
        !isEqual(
          previousFlatWorkflowVersion[property],
          flatWorkflowVersion[property],
        ),
    );

  if (updatedFields.length === 0) {
    return [];
  }

  return [
    buildUpdateMetadataEvent({
      metadataName: 'workflowVersion',
      before: previousFlatWorkflowVersion,
      after: flatWorkflowVersion,
      updatedFields,
    }),
  ];
};
