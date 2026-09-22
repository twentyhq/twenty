import { CoreWorkflowEditor } from '@/object-core/workflows/components/CoreWorkflowEditor';
import { CoreWorkflowShowToolbar } from '@/object-core/workflows/components/CoreWorkflowShowToolbar';
import { CoreWorkflowToWorkspaceRedirect } from '@/object-core/workflows/components/CoreWorkflowToWorkspaceRedirect';
import { useRenameCoreWorkflow } from '@/object-core/workflows/hooks/useRenameCoreWorkflow';
import { useValidateCoreWorkflowVersion } from '@/object-core/workflows/hooks/useValidateCoreWorkflowVersion';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { IconSettingsAutomation } from 'twenty-ui/icon';
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
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { WorkflowVisibility } from '~/generated/graphql';
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
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { record, coreWorkflow, loading, error, refetch } =
    useCoreWorkflowShowPageResource({
      coreWorkflowId,
    });
  const versions = useCoreWorkflowVersions(coreWorkflowId);

  const refetchCoreWorkflowAndVersions = useCallback(() => {
    void refetch();
    void versions.refetchCoreWorkflowVersions();
  }, [refetch, versions]);

  useListenToCoreWorkflowEvents({
    coreWorkflowId,
    refetch: refetchCoreWorkflowAndVersions,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [editedName, setEditedName] = useState<string>();
  const requestedVersionId = searchParams.get('version');
  const currentVersion = getWorkflowCurrentVersion(
    versions.coreWorkflowVersions,
  );
  const selectedVersion = isDefined(requestedVersionId)
    ? versions.coreWorkflowVersions.find(({ id }) => id === requestedVersionId)
    : currentVersion;
  const isReadOnlyVersion = isDefined(requestedVersionId);
  const isHistoricalVersion =
    isDefined(requestedVersionId) && selectedVersion?.id !== currentVersion?.id;
  const { renameWorkflow } = useRenameCoreWorkflow({
    coreWorkflowId,
    currentName: record?.name,
  });
  const { validate, isValidating } = useValidateCoreWorkflowVersion(
    selectedVersion?.id,
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
                {!isReadOnlyVersion && <RecordShowCommandMenu />}
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
            visibility={
              coreWorkflow?.visibility ?? WorkflowVisibility.WORKSPACE
            }
            canChangeVisibility={coreWorkflow?.canChangeVisibility ?? false}
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
