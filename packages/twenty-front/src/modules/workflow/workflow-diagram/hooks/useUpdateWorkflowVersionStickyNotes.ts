import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { UPDATE_WORKFLOW_VERSION_STICKY_NOTES } from '@/workflow/workflow-version/graphql/mutations/updateWorkflowVersionStickyNotes';
import { useMutation } from '@apollo/client/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowStickyNote } from 'twenty-shared/workflow';
import {
  type UpdateWorkflowVersionStickyNotesMutation,
  type UpdateWorkflowVersionStickyNotesMutationVariables,
} from '~/generated/graphql';

export const useUpdateWorkflowVersionStickyNotes = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { enqueueErrorSnackBar } = useSnackBar();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const [mutate] = useMutation<
    UpdateWorkflowVersionStickyNotesMutation,
    UpdateWorkflowVersionStickyNotesMutationVariables
  >(UPDATE_WORKFLOW_VERSION_STICKY_NOTES, { client: apolloCoreClient });

  const updateStickyNotes = async (
    workflowVersionId: string,
    notes: Array<WorkflowStickyNote>,
  ) => {
    const result = await mutate({
      variables: { input: { workflowVersionId, notes } },
      onError: (error) => {
        enqueueErrorSnackBar({ apolloError: error });
      },
    });

    if (!isDefined(result?.data)) {
      return;
    }

    const cachedRecord = getRecordFromCache<WorkflowVersion>(workflowVersionId);

    if (!isDefined(cachedRecord)) {
      return;
    }

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloCoreClient.cache,
      record: { ...cachedRecord, notes },
      recordGqlFields: { notes: true },
      objectPermissionsByObjectMetadataId,
    });
  };

  return { updateStickyNotes };
};
