import { type FieldMetadataType } from 'twenty-shared/types';

import {
  NOT_STARTED_WORKFLOW_RUN_STATUS_DEFAULT_VALUE,
  NOT_STARTED_WORKFLOW_RUN_STATUS_OPTION,
} from 'src/database/commands/upgrade-version-command/2-61/constants/restore-not-started-workflow-run-status.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const buildNotStartedWorkflowRunStatusFieldRestore = ({
  statusField,
  now,
}: {
  statusField: FlatFieldMetadata<FieldMetadataType.SELECT>;
  now: string;
}): FlatFieldMetadata<FieldMetadataType.SELECT> | undefined => {
  const statusOptions = statusField.options ?? [];

  if (
    statusOptions.some(
      ({ value }) => value === NOT_STARTED_WORKFLOW_RUN_STATUS_OPTION.value,
    )
  ) {
    return undefined;
  }

  return {
    ...statusField,
    options: [NOT_STARTED_WORKFLOW_RUN_STATUS_OPTION, ...statusOptions],
    defaultValue: NOT_STARTED_WORKFLOW_RUN_STATUS_DEFAULT_VALUE,
    updatedAt: now,
  };
};
