import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useToast } from 'twenty-ui/feedback';
import { CoreWorkflowVersionStatus } from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useRestoreCoreWorkflowVersionAsDraft = ({
  workflowId,
  workspaceWorkflowVersionId,
}: {
  workflowId: string;
  workspaceWorkflowVersionId: string;
}) => {
  const { t } = useLingui();
  const [isRestoring, setIsRestoring] = useState(false);
  const { coreWorkflowVersions, loading: isLoadingCoreWorkflowVersions } =
    useCoreWorkflowVersions(workflowId);
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const { add: addToast } = useToast();
  const navigate = useNavigateApp();

  const hasExistingDraft = coreWorkflowVersions.some(
    (coreWorkflowVersion) =>
      coreWorkflowVersion.status === CoreWorkflowVersionStatus.DRAFT,
  );

  const restoreCoreWorkflowVersionAsDraft = async () => {
    if (isRestoring) {
      return;
    }

    setIsRestoring(true);

    try {
      const draftWorkflowVersionId = await createDraftFromWorkflowVersion({
        workflowId,
        workflowVersionIdToCopy: workspaceWorkflowVersionId,
      });

      if (!isDefined(draftWorkflowVersionId)) {
        addToast({
          variant: 'error',
          children: t`Could not restore this version as draft.`,
        });

        return;
      }

      navigate(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: workflowId,
      });
    } catch {
      addToast({
        variant: 'error',
        children: t`Could not restore this version as draft.`,
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    restoreCoreWorkflowVersionAsDraft,
    isRestoring,
    hasExistingDraft,
    isLoadingCoreWorkflowVersions,
  };
};
