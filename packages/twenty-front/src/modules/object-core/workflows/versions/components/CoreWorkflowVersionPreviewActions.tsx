import { type ReactNode } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { CoreWorkflowVersionPreviewActionsContent } from '@/object-core/workflows/versions/components/CoreWorkflowVersionPreviewActionsContent';

export const CoreWorkflowVersionPreviewActions = ({
  objectNameSingular,
  objectRecordId,
  children,
}: {
  objectNameSingular: string;
  objectRecordId: string;
  children: ReactNode;
}) => {
  if (objectNameSingular !== CoreObjectNameSingular.Workflow) {
    return children;
  }

  return (
    <CoreWorkflowVersionPreviewActionsContent workflowId={objectRecordId}>
      {children}
    </CoreWorkflowVersionPreviewActionsContent>
  );
};
