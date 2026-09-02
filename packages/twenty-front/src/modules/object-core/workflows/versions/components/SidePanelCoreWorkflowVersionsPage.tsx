import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { CoreWorkflowVersionsListItem } from '@/object-core/workflows/versions/components/CoreWorkflowVersionsListItem';
import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { usePreviewWorkflowVersion } from '@/object-core/workflows/versions/hooks/usePreviewWorkflowVersion';
import { useSidePanelWorkflowIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';

export const SidePanelCoreWorkflowVersionsPage = () => {
  const { t } = useLingui();
  const workflowId = useSidePanelWorkflowIdOrThrow();
  const { coreWorkflowVersions, loading } = useCoreWorkflowVersions(workflowId);
  const { previewedWorkflowVersion, previewWorkflowVersion } =
    usePreviewWorkflowVersion(workflowId);

  return (
    <SidePanelList
      selectableItemIds={coreWorkflowVersions.map(({ id }) => id)}
      loading={loading}
      noResults={!loading && coreWorkflowVersions.length === 0}
    >
      <SidePanelGroup heading={t`Date`}>
        {coreWorkflowVersions.map((coreWorkflowVersion) => (
          <CoreWorkflowVersionsListItem
            key={coreWorkflowVersion.id}
            id={coreWorkflowVersion.id}
            createdAt={coreWorkflowVersion.createdAt}
            status={coreWorkflowVersion.status}
            isSelected={
              previewedWorkflowVersion?.coreWorkflowVersionId ===
              coreWorkflowVersion.id
            }
            isSelectable={isDefined(
              coreWorkflowVersion.workspaceWorkflowVersionId,
            )}
            onSelect={() => previewWorkflowVersion(coreWorkflowVersion)}
          />
        ))}
      </SidePanelGroup>
    </SidePanelList>
  );
};
