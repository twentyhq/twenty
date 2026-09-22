import { CoreObjectNameSingular } from 'twenty-shared/types';

import { WORKFLOW_CORE_POINTER_COLUMN } from 'src/engine/core-modules/search/constants/workflow-core-pointer-column.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const readWorkflowCorePointer = ({
  record,
  flatObjectMetadata,
}: {
  record: Record<string, unknown>;
  flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
}): string | null => {
  if (flatObjectMetadata.nameSingular !== CoreObjectNameSingular.Workflow) {
    return null;
  }

  const corePointer = record[WORKFLOW_CORE_POINTER_COLUMN];

  return typeof corePointer === 'string' ? corePointer : null;
};
