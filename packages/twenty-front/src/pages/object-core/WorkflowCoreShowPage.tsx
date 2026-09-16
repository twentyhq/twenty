import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { PermissionFlagType } from 'twenty-shared/constants';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { IconRefresh, IconSettingsAutomation } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { WorkspaceRouteUnavailable } from '@/app/routing/components/WorkspaceRouteUnavailable';
import { RecordShowCommandMenu } from '@/command-menu-item/components/RecordShowCommandMenu';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useCoreWorkflowShowPageResource } from '@/object-core/workflows/hooks/useCoreWorkflowShowPageResource';
import { CoreWorkflowVersionCard } from '@/object-core/workflows/versions/components/CoreWorkflowVersionCard';
import { CoreWorkflowVersionRestoreButton } from '@/object-core/workflows/versions/components/CoreWorkflowVersionRestoreButton';
import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { RecordShowPageResourceEffect } from '@/object-record/record-show/components/RecordShowPageResourceEffect';
import { RecordShowContainerContextStoreTargetedRecordsEffect } from '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS } from '@/object-core/workflows/versions/constants/CoreWorkflowVersionStatusTagProps';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowDiagramCanvasEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasEditable';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import { WorkflowVisualizerEffect } from '@/workflow/workflow-diagram/components/WorkflowVisualizerEffect';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import {
  GetCoreWorkflowDocument,
  UpdateCoreWorkflowDocument,
  ValidateCoreWorkflowVersionDocument,
} from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const StyledToolbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
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

  if (loading && !isDefined(coreWorkflowVersion)) return <Loader />;
  if (isDefined(error))
    return (
      <WorkspaceRouteUnavailable>{t`Could not load this workflow version.`}</WorkspaceRouteUnavailable>
    );
  if (
    !isDefined(coreWorkflowVersion) ||
    coreWorkflowVersion.coreWorkflowId !== coreWorkflowId
  )
    return (
      <WorkspaceRouteUnavailable>{t`Workflow version not found.`}</WorkspaceRouteUnavailable>
    );

  if (readonly)
    return (
      <CoreWorkflowVersionCard coreWorkflowVersionId={coreWorkflowVersionId} />
    );

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
  const requestedVersionId = searchParams.get('version');
  const currentVersion =
    versions.coreWorkflowVersions.find(({ status }) => status === 'DRAFT') ??
    versions.coreWorkflowVersions[0];
  const selectedVersion = isDefined(requestedVersionId)
    ? versions.coreWorkflowVersions.find(({ id }) => id === requestedVersionId)
    : currentVersion;
  const isHistoricalVersion =
    isDefined(requestedVersionId) && selectedVersion?.id !== currentVersion?.id;
  const [updateWorkflow] = useMutation(UpdateCoreWorkflowDocument, { client });
  const [validateVersion, { loading: isValidating }] = useMutation(
    ValidateCoreWorkflowVersionDocument,
    { client },
  );
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const renameWorkflow = async (name: string) => {
    if (name === record?.name) return;
    try {
      await updateWorkflow({ variables: { input: { coreWorkflowId, name } } });
      await invalidateCoreWorkflowVersions(client);
    } catch (mutationError) {
      enqueueErrorSnackBar({
        message:
          mutationError instanceof Error
            ? mutationError.message
            : t`Could not save workflow`,
      });
    }
  };

  const validate = async () => {
    if (!isDefined(selectedVersion)) return;
    try {
      await validateVersion({
        variables: { coreWorkflowVersionId: selectedVersion.id },
      });
      enqueueSuccessSnackBar({ message: t`Workflow is valid` });
    } catch (mutationError) {
      enqueueErrorSnackBar({
        message:
          mutationError instanceof Error
            ? mutationError.message
            : t`Could not save workflow`,
      });
    }
  };

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
  )
    return (
      <>
        {resource}
        <Loader />
      </>
    );
  if (isDefined(error) || isDefined(versions.error))
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
  if (!isDefined(record))
    return (
      <>
        {resource}
        <WorkspaceRouteUnavailable>{t`Workflow not found.`}</WorkspaceRouteUnavailable>
      </>
    );

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
                key={`${coreWorkflowId}-${record.name}`}
                aria-label={t`Workflow name`}
                defaultValue={record.name ?? ''}
                onBlur={(event) => renameWorkflow(event.target.value)}
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
          <StyledToolbar>
            <Select
              dropdownId={`core-workflow-version-${coreWorkflowId}`}
              aria-label={t`Version`}
              value={selectedVersion?.id ?? ''}
              options={versions.coreWorkflowVersions.map((version) => ({
                value: version.id,
                label: `${version.label} · ${t(CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS[version.status].label)}`,
              }))}
              onChange={(versionId) => {
                closeSidePanelMenu();
                setSearchParams(
                  versionId === currentVersion?.id
                    ? {}
                    : { version: versionId },
                );
              }}
            />
            {isHistoricalVersion && isDefined(selectedVersion) && (
              <CoreWorkflowVersionRestoreButton
                workflowId={coreWorkflowId}
                coreWorkflowVersionId={selectedVersion.id}
              />
            )}
            <Button
              title={t`Validate`}
              size="small"
              disabled={!isDefined(selectedVersion) || isValidating}
              onClick={validate}
            />
            <Button
              title={t`Refresh`}
              size="small"
              Icon={IconRefresh}
              onClick={() => invalidateCoreWorkflowVersions(client)}
            />
          </StyledToolbar>
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
  const client = useApolloCoreClient();
  const { data, loading, error } = useQuery(GetCoreWorkflowDocument, {
    client,
    variables: { coreWorkflowId },
    fetchPolicy: 'network-only',
  });
  if (loading) return <Loader />;
  const workspaceWorkflowId = data?.coreWorkflow?.workspaceWorkflowId;
  if (isDefined(error) || !isDefined(workspaceWorkflowId))
    return <WorkspaceRouteUnavailable />;
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
  const hasPermission = useHasPermissionFlag(PermissionFlagType.WORKFLOWS);
  if (!hasPermission)
    return (
      <WorkspaceRouteUnavailable>{t`You do not have permission to access workflows.`}</WorkspaceRouteUnavailable>
    );
  if (!isDefined(coreWorkflowId)) return <WorkspaceRouteUnavailable />;
  return isCore ? (
    <CoreWorkflowShowContent
      key={coreWorkflowId}
      coreWorkflowId={coreWorkflowId}
    />
  ) : (
    <WorkspaceWorkflowShowRedirect coreWorkflowId={coreWorkflowId} />
  );
};
