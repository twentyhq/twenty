import { CoreObjectNameSingular } from 'twenty-shared/types';

import { CoreWorkflowVersionPreviewActionsContent } from '@/object-core/workflows/versions/components/CoreWorkflowVersionPreviewActionsContent';

export const CoreWorkflowVersionPreviewActions = ({
  objectNameSingular,
  objectRecordId,
}: {
  objectNameSingular: string;
  objectRecordId: string;
}) => {
  if (objectNameSingular !== CoreObjectNameSingular.Workflow) {
    return null;
  }

  return (
    <CoreWorkflowVersionPreviewActionsContent workflowId={objectRecordId} />
  );
};
