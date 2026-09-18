import { CoreWorkflowShowToolbar } from '@/object-core/workflows/components/CoreWorkflowShowToolbar';
import { useCoreWorkflowShowActions } from '@/object-core/workflows/hooks/useCoreWorkflowShowActions';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { PermissionFlagType } from 'twenty-shared/constants';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconSettingsAutomation } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { RecordShowCommandMenu } from '@/command-menu-item/components/RecordShowCommandMenu';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useCoreWorkflowShowPageResource } from '@/object-core/workflows/hooks/useCoreWorkflowShowPageResource';
import { CoreWorkflowVersionCard } from '@/object-core/workflows/versions/components/CoreWorkflowVersionCard';
import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { RecordShowPageResourceEffect } from '@/object-record/record-show/components/RecordShowPageResourceEffect';
import { RecordShowContainerContextStoreTargetedRecordsEffect } from '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { type Workflow } from '@/workflow/types/Workflow';
import { getWorkflowCurrentVersion } from '@/workflow/utils/getWorkflowCurrentVersion';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import { WorkflowVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVisualizerEffect';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const CoreWorkflowEditor = ({
  coreWorkflowId,
  coreWorkflowVersionId,
  readonly,
}: {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
  readonly: boolean;
}) => {
  const { coreWorkflowVersion, loading, error } = useCoreWorkflowVersion(
    coreWorkflowVersionId,
  );

  if (loading && !isDefined(coreWorkflowVersion)) {
    return <Loader />;
  }
  if (isDefined(error)) {
    return (
      <WorkspaceRouteUnavailable>{t`Could not load this workflow version.`}</WorkspaceRouteUnavailable>
    );
  }
  if (
    !isDefined(coreWorkflowVersion) ||
    coreWorkflowVersion.coreWorkflowId !== coreWorkflowId
  ) {
    return (
      <WorkspaceRouteUnavailable>{t`Workflow version not found.`}</WorkspaceRouteUnavailable>
    );
  }

  if (readonly) {
    return (
      <CoreWorkflowVersionCard coreWorkflowVersionId={coreWorkflowVersionId} />
    );
  }

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: coreWorkflowId,
        }),
      }}
    >
      <WorkflowVisualizerEffect workflowId={coreWorkflowId} />
      <WorkflowDiagramEffect />
      <WorkflowDiagramCanvasEditable />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};

const CoreWorkflowShowContent = ({
  coreWorkflowId,
}: {
  coreWorkflowId: string;
}) => {
  const client = useApolloCoreClient();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { record, loading, error } = useCoreWorkflowShowPageResource({
    coreWorkflowId,
  });
  const versions = useCoreWorkflowVersions(coreWorkflowId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [editedName, setEditedName] = useState<string>();
  const requestedVersionId = searchParams.get('version');
  const currentVersion = getWorkflowCurrentVersion(
    versions.coreWorkflowVersions,
  );
  const [previousCurrentVersionId, setPreviousCurrentVersionId] = useState(
    currentVersion?.id,
  );

  useEffect(() => {
    const shouldFollowNewDraft =
      currentVersion?.status === 'DRAFT' &&
      isDefined(requestedVersionId) &&
      requestedVersionId === previousCurrentVersionId &&
      requestedVersionId !== currentVersion.id;

    setPreviousCurrentVersionId(currentVersion?.id);

    if (shouldFollowNewDraft) {
      setSearchParams({}, { replace: true });
    }
  }, [
    currentVersion,
    previousCurrentVersionId,
    requestedVersionId,
    setSearchParams,
  ]);
  const selectedVersion = isDefined(requestedVersionId)
    ? versions.coreWorkflowVersions.find(({ id }) => id === requestedVersionId)
    : currentVersion;
  const isHistoricalVersion =
    isDefined(requestedVersionId) && selectedVersion?.id !== currentVersion?.id;
  const { renameWorkflow, validate, isValidating } = useCoreWorkflowShowActions(
    {
      coreWorkflowId,
      coreWorkflowVersionId: selectedVersion?.id,
      name: record?.name,
    },
  );

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
            icon={<IconSettingsAutomation />}
            title={
              <TextInput
                placeholder={t`Workflow name`}
                value={editedName ?? record.name ?? ''}
                onChange={setEditedName}
                onBlur={async (event) => {
                  const name = event.target.value;
                  const didSave = await renameWorkflow(name);
                  if (didSave) {
                    setEditedName((currentName) =>
                      currentName === name ? undefined : currentName,
                    );
                  }
                }}
              />
            }
            actionButton={
              <>
                {!isHistoricalVersion && <RecordShowCommandMenu />}
                <SidePanelToggleButton />
              </>
            }
          />
        }
      >
        <StyledContainer>
          <CoreWorkflowShowToolbar
            coreWorkflowId={coreWorkflowId}
            versions={versions.coreWorkflowVersions}
            selectedVersionId={selectedVersion?.id}
            isHistoricalVersion={isHistoricalVersion}
            isValidating={isValidating}
            onVersionChange={(versionId) => {
              closeSidePanelMenu();
              setSearchParams(
                versionId === currentVersion?.id ? {} : { version: versionId },
              );
            }}
            onValidate={validate}
            onRefresh={() => invalidateCoreWorkflowVersions(client)}
          />
          {isDefined(selectedVersion) ? (
            <CoreWorkflowEditor
              key={selectedVersion.id}
              coreWorkflowId={coreWorkflowId}
              coreWorkflowVersionId={selectedVersion.id}
              readonly={isHistoricalVersion}
            />
          ) : (
            <WorkspaceRouteUnavailable>{t`Workflow version not found.`}</WorkspaceRouteUnavailable>
          )}
        </StyledContainer>
      </PageCardLayout>
    </CommandMenuComponentInstanceContext.Provider>
  );
};

const WorkspaceWorkflowShowRedirect = ({
  coreWorkflowId,
}: {
  coreWorkflowId: string;
}) => {
  const { records, loading } = useFindManyRecords<
    Pick<Workflow, 'id' | '__typename'> & { coreWorkflowId: string | null }
  >({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    filter: { coreWorkflowId: { eq: coreWorkflowId } },
    recordGqlFields: { id: true, coreWorkflowId: true },
  });
  if (loading) {
    return <Loader />;
  }
  const workspaceWorkflowId = records[0]?.id;
  if (!isDefined(workspaceWorkflowId)) {
    return <WorkspaceRouteUnavailable />;
  }
  return (
    <Navigate
      replace
      to={getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: workspaceWorkflowId,
      })}
    />
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
    <WorkspaceWorkflowShowRedirect coreWorkflowId={coreWorkflowId} />
  );
};
