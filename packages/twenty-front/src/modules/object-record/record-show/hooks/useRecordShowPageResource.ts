import { useMemo } from 'react';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';

import { useCoreWorkflowShowPageResource } from '@/object-core/workflows/hooks/useCoreWorkflowShowPageResource';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { buildFindOneRecordForShowPageOperationSignature } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useRecordShowPageResource = ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: string;
  recordId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const shouldReadWorkflowThroughCore =
    isWorkflowCoreIndexPageEnabled &&
    objectNameSingular === CoreObjectNameSingular.Workflow;

  const operationSignature = useMemo(
    () =>
      buildFindOneRecordForShowPageOperationSignature({
        objectMetadataItem,
        objectMetadataItems,
      }),
    [objectMetadataItem, objectMetadataItems],
  );

  const coreWorkflowResult = useCoreWorkflowShowPageResource({
    workspaceWorkflowId: recordId,
    skip: !shouldReadWorkflowThroughCore,
  });

  const workspaceResult = useFindOneRecord({
    objectRecordId: recordId,
    objectNameSingular,
    recordGqlFields: operationSignature.fields,
    withSoftDeleted: true,
    skip: shouldReadWorkflowThroughCore,
  });

  return shouldReadWorkflowThroughCore ? coreWorkflowResult : workspaceResult;
};
