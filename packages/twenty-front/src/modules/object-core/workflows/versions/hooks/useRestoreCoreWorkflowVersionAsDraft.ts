import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useToast } from 'twenty-ui/components';
import { CoreWorkflowVersionStatus } from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useRestoreCoreWorkflowVersionAsDraft = ({
  workflowId,
  coreWorkflowVersionId,
}: {
  workflowId: string;
  coreWorkflowVersionId: string;
}) => {
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { t } = useLingui();
  const [isRestoring, setIsRestoring] = useState(false);
  const { coreWorkflowVersions, loading: isLoadingCoreWorkflowVersions } =
    useCoreWorkflowVersions(workflowId);
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const { enqueueToast } = useToast();
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
        workflowVersionIdToCopy: coreWorkflowVersionId,
      });

      if (!isDefined(draftWorkflowVersionId)) {
        enqueueToast({
          variant: 'error',
          children: t`Could not restore this version as draft.`,
        });

        return;
      }

      closeSidePanelMenu();
      navigate(AppPath.WorkflowCoreShowPage, { coreWorkflowId: workflowId });
    } catch {
      enqueueToast({
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
