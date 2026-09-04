import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { CoreWorkflowVersionsListItem } from '@/object-core/workflows/versions/components/CoreWorkflowVersionsListItem';
import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { useOpenCoreWorkflowVersionSidePanel } from '@/object-core/workflows/versions/hooks/useOpenCoreWorkflowVersionSidePanel';
import { useSidePanelWorkflowIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledError = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

export const SidePanelCoreWorkflowVersionsPage = () => {
  const { t } = useLingui();
  const workflowId = useSidePanelWorkflowIdOrThrow();
  const { coreWorkflowVersions, loading, error } =
    useCoreWorkflowVersions(workflowId);
  const { openCoreWorkflowVersionSidePanel } =
    useOpenCoreWorkflowVersionSidePanel();

  const selectableCoreWorkflowVersionIds = coreWorkflowVersions
    .filter(({ workspaceWorkflowVersionId }) =>
      isDefined(workspaceWorkflowVersionId),
    )
    .map(({ id }) => id);

  return (
    <SidePanelList
      selectableItemIds={selectableCoreWorkflowVersionIds}
      loading={loading}
      noResults={
        !loading && !isDefined(error) && coreWorkflowVersions.length === 0
      }
    >
      {isDefined(error) && (
        <StyledError>{t`Could not load versions.`}</StyledError>
      )}
      <SidePanelGroup heading={t`Versions`}>
        {coreWorkflowVersions.map((coreWorkflowVersion) => (
          <CoreWorkflowVersionsListItem
            key={coreWorkflowVersion.id}
            id={coreWorkflowVersion.id}
            label={coreWorkflowVersion.label}
            createdAt={coreWorkflowVersion.createdAt}
            status={coreWorkflowVersion.status}
            isSelectable={isDefined(
              coreWorkflowVersion.workspaceWorkflowVersionId,
            )}
            onSelect={() => {
              if (!isDefined(coreWorkflowVersion.workspaceWorkflowVersionId)) {
                return;
              }

              openCoreWorkflowVersionSidePanel({
                workspaceWorkflowVersionId:
                  coreWorkflowVersion.workspaceWorkflowVersionId,
                pageTitle: coreWorkflowVersion.label,
              });
            }}
          />
        ))}
      </SidePanelGroup>
    </SidePanelList>
  );
};
