import { HeadlessFrontComponentRendererEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessFrontComponentRendererEngineCommand';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { HeadlessOpenSidePanelPageEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessOpenSidePanelPageEngineCommand';
import { NavigationEngineCommand } from '@/command-menu-item/engine-command/components/NavigationEngineCommand';
import { ComposeEmailCommand } from '@/command-menu-item/engine-command/global/components/ComposeEmailCommand';
import { DeleteRecordsCommand } from '@/command-menu-item/engine-command/record/components/DeleteRecordsCommand';
import { DestroyRecordsCommand } from '@/command-menu-item/engine-command/record/components/DestroyRecordsCommand';
import { ExportRecordsCommand } from '@/command-menu-item/engine-command/record/components/ExportRecordsCommand';
import { RestoreRecordsCommand } from '@/command-menu-item/engine-command/record/components/RestoreRecordsCommand';
import { TriggerWorkflowVersionEngineCommand } from '@/command-menu-item/engine-command/record/components/TriggerWorkflowVersionEngineCommand';
import { MergeMultipleRecordsCommand } from '@/command-menu-item/engine-command/record/multiple-records/components/MergeMultipleRecordsCommand';
import { UpdateMultipleRecordsCommand } from '@/command-menu-item/engine-command/record/multiple-records/components/UpdateMultipleRecordsCommand';
import { CreateNewIndexRecordNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateNewIndexRecordNoSelectionRecordCommand';
import { CreateNewViewNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateNewViewNoSelectionRecordCommand';
import { HideDeletedRecordsNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/HideDeletedRecordsNoSelectionRecordCommand';
import { ImportRecordsNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/ImportRecordsNoSelectionRecordCommand';
import { SeeDeletedRecordsNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/SeeDeletedRecordsNoSelectionRecordCommand';
import { AddToFavoritesSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/components/AddToFavoritesSingleRecordCommand';
import { ExportNoteSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/components/ExportNoteSingleRecordCommand';
import { NavigateToNextRecordSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/components/NavigateToNextRecordSingleRecordCommand';
import { NavigateToPreviousRecordSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/components/NavigateToPreviousRecordSingleRecordCommand';
import { RemoveFromFavoritesSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/components/RemoveFromFavoritesSingleRecordCommand';
import { CancelDashboardSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/dashboard/components/CancelDashboardSingleRecordCommand';
import { DuplicateDashboardSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/dashboard/components/DuplicateDashboardSingleRecordCommand';
import { EditDashboardSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/dashboard/components/EditDashboardSingleRecordCommand';
import { SaveDashboardSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/dashboard/components/SaveDashboardSingleRecordCommand';
import { ReplyToEmailThreadCommand } from '@/command-menu-item/engine-command/record/single-record/message-thread/components/ReplyToEmailThreadCommand';
import { EditRecordPageLayoutSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/record-page-layout/components/EditRecordPageLayoutSingleRecordCommand';
import { SeeVersionWorkflowRunSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow-runs/components/SeeVersionWorkflowRunSingleRecordCommand';
import { SeeWorkflowWorkflowRunSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow-runs/components/SeeWorkflowWorkflowRunSingleRecordCommand';
import { StopWorkflowRunSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow-runs/components/StopWorkflowRunSingleRecordCommand';
import { SeeRunsWorkflowVersionSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow-versions/components/SeeRunsWorkflowVersionSingleRecordCommand';
import { SeeVersionsWorkflowVersionSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow-versions/components/SeeVersionsWorkflowVersionSingleRecordCommand';
import { SeeWorkflowWorkflowVersionSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow-versions/components/SeeWorkflowWorkflowVersionSingleRecordCommand';
import { UseAsDraftWorkflowVersionSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow-versions/components/UseAsDraftWorkflowVersionSingleRecordCommand';
import { ActivateWorkflowSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow/components/ActivateWorkflowSingleRecordCommand';
import { AddNodeWorkflowSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow/components/AddNodeWorkflowSingleRecordCommand';
import { DeactivateWorkflowSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow/components/DeactivateWorkflowSingleRecordCommand';
import { DiscardDraftWorkflowSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow/components/DiscardDraftWorkflowSingleRecordCommand';
import { DuplicateWorkflowSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow/components/DuplicateWorkflowSingleRecordCommand';
import { SeeActiveVersionWorkflowSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow/components/SeeActiveVersionWorkflowSingleRecordCommand';
import { SeeRunsWorkflowSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow/components/SeeRunsWorkflowSingleRecordCommand';
import { SeeVersionsWorkflowSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow/components/SeeVersionsWorkflowSingleRecordCommand';
import { TestWorkflowSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow/components/TestWorkflowSingleRecordCommand';
import { TidyUpWorkflowSingleRecordCommand } from '@/command-menu-item/engine-command/record/single-record/workflow/components/TidyUpWorkflowSingleRecordCommand';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { msg } from '@lingui/core/macro';
import { AppPath, SettingsPath, SidePanelPages } from 'twenty-shared/types';
import { IconHistory, IconSearch, IconSparkles } from 'twenty-ui/display';
import { EngineComponentKey } from '~/generated-metadata/graphql';

export const ENGINE_COMPONENT_KEY_COMPONENT_MAP: Record<
  EngineComponentKey,
  React.ReactNode
> = {
  [EngineComponentKey.CREATE_NEW_RECORD]: (
    <CreateNewIndexRecordNoSelectionRecordCommand />
  ),
  [EngineComponentKey.DELETE_RECORDS]: <DeleteRecordsCommand />,
  [EngineComponentKey.RESTORE_RECORDS]: <RestoreRecordsCommand />,
  [EngineComponentKey.DESTROY_RECORDS]: <DestroyRecordsCommand />,
  [EngineComponentKey.ADD_TO_FAVORITES]: <AddToFavoritesSingleRecordCommand />,
  [EngineComponentKey.REMOVE_FROM_FAVORITES]: (
    <RemoveFromFavoritesSingleRecordCommand />
  ),
  [EngineComponentKey.MERGE_MULTIPLE_RECORDS]: <MergeMultipleRecordsCommand />,
  [EngineComponentKey.DUPLICATE_DASHBOARD]: (
    <DuplicateDashboardSingleRecordCommand />
  ),
  [EngineComponentKey.DUPLICATE_WORKFLOW]: (
    <DuplicateWorkflowSingleRecordCommand />
  ),
  [EngineComponentKey.ACTIVATE_WORKFLOW]: (
    <ActivateWorkflowSingleRecordCommand />
  ),
  [EngineComponentKey.DEACTIVATE_WORKFLOW]: (
    <DeactivateWorkflowSingleRecordCommand />
  ),
  [EngineComponentKey.DISCARD_DRAFT_WORKFLOW]: (
    <DiscardDraftWorkflowSingleRecordCommand />
  ),
  [EngineComponentKey.TEST_WORKFLOW]: <TestWorkflowSingleRecordCommand />,
  [EngineComponentKey.STOP_WORKFLOW_RUN]: (
    <StopWorkflowRunSingleRecordCommand />
  ),
  [EngineComponentKey.USE_AS_DRAFT_WORKFLOW_VERSION]: (
    <UseAsDraftWorkflowVersionSingleRecordCommand />
  ),
  [EngineComponentKey.SAVE_DASHBOARD_LAYOUT]: (
    <SaveDashboardSingleRecordCommand />
  ),
  [EngineComponentKey.TIDY_UP_WORKFLOW]: <TidyUpWorkflowSingleRecordCommand />,
  [EngineComponentKey.NAVIGATE_TO_NEXT_RECORD]: (
    <NavigateToNextRecordSingleRecordCommand />
  ),
  [EngineComponentKey.NAVIGATE_TO_PREVIOUS_RECORD]: (
    <NavigateToPreviousRecordSingleRecordCommand />
  ),
  [EngineComponentKey.EXPORT_NOTE_TO_PDF]: <ExportNoteSingleRecordCommand />,
  [EngineComponentKey.EXPORT_RECORDS]: <ExportRecordsCommand />,
  [EngineComponentKey.UPDATE_MULTIPLE_RECORDS]: (
    <UpdateMultipleRecordsCommand />
  ),
  [EngineComponentKey.IMPORT_RECORDS]: (
    <ImportRecordsNoSelectionRecordCommand />
  ),
  [EngineComponentKey.EXPORT_VIEW]: <ExportRecordsCommand />,
  [EngineComponentKey.SEE_DELETED_RECORDS]: (
    <SeeDeletedRecordsNoSelectionRecordCommand />
  ),
  [EngineComponentKey.CREATE_NEW_VIEW]: (
    <CreateNewViewNoSelectionRecordCommand />
  ),
  [EngineComponentKey.HIDE_DELETED_RECORDS]: (
    <HideDeletedRecordsNoSelectionRecordCommand />
  ),
  [EngineComponentKey.EDIT_RECORD_PAGE_LAYOUT]: (
    <EditRecordPageLayoutSingleRecordCommand />
  ),
  [EngineComponentKey.EDIT_DASHBOARD_LAYOUT]: (
    <EditDashboardSingleRecordCommand />
  ),
  [EngineComponentKey.CANCEL_DASHBOARD_LAYOUT]: (
    <CancelDashboardSingleRecordCommand />
  ),
  [EngineComponentKey.NAVIGATION]: <NavigationEngineCommand />,
  // TODO: Remove these keys once we have ran the migration command `upgrade:1-21:refactor-navigation-commands`
  // These keys are kept for backward compatibility during migration
  [EngineComponentKey.GO_TO_PEOPLE]: (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.Person }}
    />
  ),
  [EngineComponentKey.GO_TO_COMPANIES]: (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.Company }}
    />
  ),
  [EngineComponentKey.GO_TO_DASHBOARDS]: (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.Dashboard }}
    />
  ),
  [EngineComponentKey.GO_TO_OPPORTUNITIES]: (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{
        objectNamePlural: CoreObjectNamePlural.Opportunity,
      }}
    />
  ),
  [EngineComponentKey.GO_TO_SETTINGS]: (
    <HeadlessNavigateEngineCommand
      to={AppPath.SettingsCatchAll}
      params={{
        '*': SettingsPath.ProfilePage,
      }}
    />
  ),
  [EngineComponentKey.GO_TO_TASKS]: (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.Task }}
    />
  ),
  [EngineComponentKey.GO_TO_NOTES]: (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.Note }}
    />
  ),
  [EngineComponentKey.GO_TO_WORKFLOWS]: (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.Workflow }}
    />
  ),
  [EngineComponentKey.GO_TO_RUNS]: (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.WorkflowRun }}
    />
  ),
  [EngineComponentKey.SEARCH_RECORDS]: (
    <HeadlessOpenSidePanelPageEngineCommand
      page={SidePanelPages.SearchRecords}
      pageTitle={msg`Search`}
      pageIcon={IconSearch}
      shouldResetSearchState={true}
    />
  ),
  [EngineComponentKey.SEARCH_RECORDS_FALLBACK]: (
    <HeadlessOpenSidePanelPageEngineCommand
      page={SidePanelPages.SearchRecords}
      pageTitle={msg`Search`}
      pageIcon={IconSearch}
    />
  ),
  [EngineComponentKey.ASK_AI]: (
    <HeadlessOpenSidePanelPageEngineCommand
      page={SidePanelPages.AskAI}
      pageTitle={msg`Ask AI`}
      pageIcon={IconSparkles}
    />
  ),
  [EngineComponentKey.VIEW_PREVIOUS_AI_CHATS]: (
    <HeadlessOpenSidePanelPageEngineCommand
      page={SidePanelPages.ViewPreviousAIChats}
      pageTitle={msg`View Previous AI Chats`}
      pageIcon={IconHistory}
    />
  ),
  [EngineComponentKey.SEE_ACTIVE_VERSION_WORKFLOW]: (
    <SeeActiveVersionWorkflowSingleRecordCommand />
  ),
  [EngineComponentKey.SEE_RUNS_WORKFLOW]: (
    <SeeRunsWorkflowSingleRecordCommand />
  ),
  [EngineComponentKey.SEE_VERSIONS_WORKFLOW]: (
    <SeeVersionsWorkflowSingleRecordCommand />
  ),
  [EngineComponentKey.ADD_NODE_WORKFLOW]: (
    <AddNodeWorkflowSingleRecordCommand />
  ),
  [EngineComponentKey.SEE_VERSION_WORKFLOW_RUN]: (
    <SeeVersionWorkflowRunSingleRecordCommand />
  ),
  [EngineComponentKey.SEE_WORKFLOW_WORKFLOW_RUN]: (
    <SeeWorkflowWorkflowRunSingleRecordCommand />
  ),
  [EngineComponentKey.SEE_RUNS_WORKFLOW_VERSION]: (
    <SeeRunsWorkflowVersionSingleRecordCommand />
  ),
  [EngineComponentKey.SEE_WORKFLOW_WORKFLOW_VERSION]: (
    <SeeWorkflowWorkflowVersionSingleRecordCommand />
  ),
  [EngineComponentKey.SEE_VERSIONS_WORKFLOW_VERSION]: (
    <SeeVersionsWorkflowVersionSingleRecordCommand />
  ),
  [EngineComponentKey.TRIGGER_WORKFLOW_VERSION]: (
    <TriggerWorkflowVersionEngineCommand />
  ),
  [EngineComponentKey.FRONT_COMPONENT_RENDERER]: (
    <HeadlessFrontComponentRendererEngineCommand />
  ),
  [EngineComponentKey.REPLY_TO_EMAIL_THREAD]: <ReplyToEmailThreadCommand />,
  [EngineComponentKey.COMPOSE_EMAIL]: <ComposeEmailCommand />,

  // Deprecated keys kept for backward compatibility until migration runs
  [EngineComponentKey.DELETE_SINGLE_RECORD]: <DeleteRecordsCommand />,
  [EngineComponentKey.DELETE_MULTIPLE_RECORDS]: <DeleteRecordsCommand />,
  [EngineComponentKey.RESTORE_SINGLE_RECORD]: <RestoreRecordsCommand />,
  [EngineComponentKey.RESTORE_MULTIPLE_RECORDS]: <RestoreRecordsCommand />,
  [EngineComponentKey.DESTROY_SINGLE_RECORD]: <DestroyRecordsCommand />,
  [EngineComponentKey.DESTROY_MULTIPLE_RECORDS]: <DestroyRecordsCommand />,
  [EngineComponentKey.EXPORT_FROM_RECORD_INDEX]: <ExportRecordsCommand />,
  [EngineComponentKey.EXPORT_FROM_RECORD_SHOW]: <ExportRecordsCommand />,
  [EngineComponentKey.EXPORT_MULTIPLE_RECORDS]: <ExportRecordsCommand />,
};
