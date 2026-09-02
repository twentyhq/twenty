import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';

import { CoreWorkflowVersionCard } from '@/object-core/workflows/versions/components/CoreWorkflowVersionCard';
import { CoreWorkflowVersionRestoreButton } from '@/object-core/workflows/versions/components/CoreWorkflowVersionRestoreButton';
import { CoreWorkflowVersionSeeWorkflowButton } from '@/object-core/workflows/versions/components/CoreWorkflowVersionSeeWorkflowButton';
import { CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS } from '@/object-core/workflows/versions/constants/CoreWorkflowVersionStatusTagProps';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';

export const CoreWorkflowVersionShowPage = ({
  workspaceWorkflowVersionId,
}: {
  workspaceWorkflowVersionId: string;
}) => {
  const { t } = useLingui();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const { coreWorkflowVersion } = useCoreWorkflowVersion(
    workspaceWorkflowVersionId,
  );

  const title = coreWorkflowVersion?.label ?? t`Version`;
  const tagProps = isDefined(coreWorkflowVersion)
    ? CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS[coreWorkflowVersion.status]
    : undefined;

  return (
    <>
      <PageTitle title={title} />
      <PageCardLayout
        header={
          <PageCardHeader
            title={title}
            tag={
              isDefined(tagProps) && (
                <Tag color={tagProps.color} text={t(tagProps.label)} />
              )
            }
            actionButton={
              <>
                {isDefined(coreWorkflowVersion) && (
                  <>
                    <CoreWorkflowVersionSeeWorkflowButton
                      workflowId={coreWorkflowVersion.workspaceWorkflowId}
                    />
                    <CoreWorkflowVersionRestoreButton
                      workflowId={coreWorkflowVersion.workspaceWorkflowId}
                      workspaceWorkflowVersionId={workspaceWorkflowVersionId}
                    />
                  </>
                )}
                {!isInSidePanel && <SidePanelToggleButton />}
              </>
            }
          />
        }
      >
        <CoreWorkflowVersionCard
          workspaceWorkflowVersionId={workspaceWorkflowVersionId}
        />
      </PageCardLayout>
    </>
  );
};
