import { CoreObjectNameSingular } from 'twenty-shared/types';

import { CoreWorkflowVersionBreadcrumbSuffixContent } from '@/object-core/workflows/versions/components/CoreWorkflowVersionBreadcrumbSuffixContent';

export const CoreWorkflowVersionBreadcrumbSuffix = ({
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
    <CoreWorkflowVersionBreadcrumbSuffixContent workflowId={objectRecordId} />
  );
};
