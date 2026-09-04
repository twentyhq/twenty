import { useCallback } from 'react';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useCreateCoreWorkflow = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  const navigate = useNavigateApp();

  const canCreateCoreWorkflow = canCreateRecordsForObjectMetadataItem({
    objectPermissions,
    objectMetadataItem,
  });

  const createCoreWorkflow = useCallback(async () => {
    const workflowId = v4();

    await createOneRecord({ id: workflowId });

    navigate(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Workflow,
      objectRecordId: workflowId,
    });
  }, [createOneRecord, navigate]);

  return { createCoreWorkflow, canCreateCoreWorkflow };
};
