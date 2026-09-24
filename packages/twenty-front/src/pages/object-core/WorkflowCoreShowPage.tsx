import { CoreWorkflowEditor } from '@/object-core/workflows/components/CoreWorkflowEditor';
import { CoreWorkflowIdentifierBar } from '@/object-core/workflows/components/CoreWorkflowIdentifierBar';
import { CoreWorkflowToWorkspaceRedirect } from '@/object-core/workflows/components/CoreWorkflowToWorkspaceRedirect';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { PermissionFlagType } from 'twenty-shared/constants';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { RecordShowCommandMenu } from '@/command-menu-item/components/RecordShowCommandMenu';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useCoreWorkflowShowPageResource } from '@/object-core/workflows/hooks/useCoreWorkflowShowPageResource';
import { useListenToCoreWorkflowEvents } from '@/object-core/workflows/hooks/useListenToCoreWorkflowEvents';
import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordShowPageResourceEffect } from '@/object-record/record-show/components/RecordShowPageResourceEffect';
import { RecordShowContainerContextStoreTargetedRecordsEffect } from '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { getWorkflowCurrentVersion } from '@/workflow/utils/getWorkflowCurrentVersion';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const CoreWorkflowShowContent = ({
  coreWorkflowId,
}: {
  coreWorkflowId: string;
}) => {
  const client = useApolloCoreClient();
  const { record, coreWorkflow, loading, error, refetch } =
    useCoreWorkflowShowPageResource({
      coreWorkflowId,
    });
  const versions = useCoreWorkflowVersions(coreWorkflowId);
  const { refetchCoreWorkflowVersions } = versions;

  const refetchCoreWorkflowAndVersions = useCallback(() => {
    void refetch();
    void refetchCoreWorkflowVersions();
  }, [refetch, refetchCoreWorkflowVersions]);

  useListenToCoreWorkflowEvents({
    coreWorkflowId,
    refetch: refetchCoreWorkflowAndVersions,
  });

  const [searchParams] = useSearchParams();
  const requestedVersionId = searchParams.get('version');
  const currentVersion = getWorkflowCurrentVersion({
    versions: versions.coreWorkflowVersions,
    lastPublishedVersionId: coreWorkflow?.lastPublishedCoreWorkflowVersionId,
  });
  const selectedVersion = isDefined(requestedVersionId)
    ? versions.coreWorkflowVersions.find(({ id }) => id === requestedVersionId)
    : currentVersion;
  const isReadOnlyVersion = isDefined(requestedVersionId);

  const resource = (
    <RecordShowPageResourceEffect
      recordId={coreWorkflowId}
      loading={loading}
      record={isDefined(error) ? undefined : record}
    />
  );

  if (
    (loading && !isDefined(record)) ||
    (versions.loading && versions.coreWorkflowVersions.length === 0)
  ) {
    return (
      <>
        {resource}
        <Loader />
      </>
    );
  }
  if (isDefined(error) || isDefined(versions.error)) {
    return (
      <>
        {resource}
        <WorkspaceRouteUnavailable>
          {t`Could not load this workflow.`}
          <Button
            title={t`Retry`}
            onClick={() => invalidateCoreWorkflowVersions(client)}
          />
        </WorkspaceRouteUnavailable>
      </>
    );
  }
  if (!isDefined(record)) {
    return (
      <>
        {resource}
        <WorkspaceRouteUnavailable>{t`Workflow not found.`}</WorkspaceRouteUnavailable>
      </>
    );
  }

  return (
    <CommandMenuComponentInstanceContext.Provider
      value={{ instanceId: `core-workflow-${coreWorkflowId}` }}
    >
      {resource}
      <RecordShowContainerContextStoreTargetedRecordsEffect
        recordId={coreWorkflowId}
      />
      <PageTitle title={record.name ?? t`Workflow`} />
      <PageCardLayout
        header={
          <PageCardHeader
            links={[
              {
                children: t`Workflows`,
                href: getAppPath(AppPath.WorkflowCoreIndexPage),
              },
              { children: record.name ?? '' },
            ]}
            actionButton={
              <>
                {!isReadOnlyVersion && <RecordShowCommandMenu />}
                <SidePanelToggleButton />
              </>
            }
          />
        }
      >
        <StyledContainer>
          <CoreWorkflowIdentifierBar
            coreWorkflowId={coreWorkflowId}
            name={record.name}
          />
          {isDefined(selectedVersion) ? (
            <CoreWorkflowEditor
              key={selectedVersion.id}
              coreWorkflowId={coreWorkflowId}
              coreWorkflowVersionId={selectedVersion.id}
              readonly={isReadOnlyVersion}
            />
          ) : (
            <WorkspaceRouteUnavailable>{t`Workflow version not found.`}</WorkspaceRouteUnavailable>
          )}
        </StyledContainer>
      </PageCardLayout>
    </CommandMenuComponentInstanceContext.Provider>
  );
};

export const WorkflowCoreShowPage = () => {
  const { coreWorkflowId } = useParams<{ coreWorkflowId: string }>();
  const isCore = useIsWorkflowCoreEnabled();
  const canManageWorkflows = useHasPermissionFlag(PermissionFlagType.WORKFLOWS);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });
  const workflowObjectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );
  if (
    !workflowObjectPermissions.canReadObjectRecords ||
    (isCore && !canManageWorkflows)
  ) {
    return (
      <WorkspaceRouteUnavailable>{t`You do not have permission to access workflows.`}</WorkspaceRouteUnavailable>
    );
  }
  if (!isDefined(coreWorkflowId)) {
    return <WorkspaceRouteUnavailable />;
  }
  return isCore ? (
    <CoreWorkflowShowContent
      key={coreWorkflowId}
      coreWorkflowId={coreWorkflowId}
    />
  ) : (
    <CoreWorkflowToWorkspaceRedirect coreWorkflowId={coreWorkflowId} />
  );
};
