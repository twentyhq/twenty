import { useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useCoreWorkflowShowPageResource } from '@/object-core/workflows/hooks/useCoreWorkflowShowPageResource';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { buildFindOneRecordForShowPageOperationSignature } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';

export const useRecordShowPageResource = ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: string;
  recordId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();

  const shouldReadWorkflowThroughCore =
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

  const isCoreWorkflowMissing =
    shouldReadWorkflowThroughCore &&
    !coreWorkflowResult.loading &&
    !isDefined(coreWorkflowResult.record);

  const workspaceResult = useFindOneRecord({
    objectRecordId: recordId,
    objectNameSingular,
    recordGqlFields: operationSignature.fields,
    withSoftDeleted: true,
    skip: shouldReadWorkflowThroughCore && !isCoreWorkflowMissing,
  });

  if (shouldReadWorkflowThroughCore && !isCoreWorkflowMissing) {
    return coreWorkflowResult;
  }

  return workspaceResult;
};
