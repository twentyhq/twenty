import { type FieldMetadataType } from 'twenty-shared/types';

import {
  ENQUEUED_WORKFLOW_RUN_STATUS_DEFAULT_VALUE,
  NOT_STARTED_WORKFLOW_RUN_STATUS,
} from 'src/database/commands/upgrade-version-command/2-62/constants/drop-not-started-workflow-run-status.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const buildWorkflowRunStatusFieldUpdate = ({
  statusField,
  now,
}: {
  statusField: FlatFieldMetadata<FieldMetadataType.SELECT>;
  now: string;
}): FlatFieldMetadata<FieldMetadataType.SELECT> | undefined => {
  const statusOptions = statusField.options ?? [];
  const hasNotStartedOption = statusOptions.some(
    ({ value }) => value === NOT_STARTED_WORKFLOW_RUN_STATUS,
  );

  if (
    !hasNotStartedOption &&
    statusField.defaultValue === ENQUEUED_WORKFLOW_RUN_STATUS_DEFAULT_VALUE
  ) {
    return undefined;
  }

  return {
    ...statusField,
    options: statusOptions.filter(
      ({ value }) => value !== NOT_STARTED_WORKFLOW_RUN_STATUS,
    ),
    defaultValue: ENQUEUED_WORKFLOW_RUN_STATUS_DEFAULT_VALUE,
    updatedAt: now,
  };
};
