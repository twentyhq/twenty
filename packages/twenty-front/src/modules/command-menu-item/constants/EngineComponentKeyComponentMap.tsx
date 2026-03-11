import { DeleteMultipleRecordsCommand } from '@/command-menu-item/record/multiple-records/components/DeleteMultipleRecordsCommand';
import { DestroyMultipleRecordsCommand } from '@/command-menu-item/record/multiple-records/components/DestroyMultipleRecordsCommand';
import { MergeMultipleRecordsCommand } from '@/command-menu-item/record/multiple-records/components/MergeMultipleRecordsCommand';
import { RestoreMultipleRecordsCommand } from '@/command-menu-item/record/multiple-records/components/RestoreMultipleRecordsCommand';
import { CreateNewIndexRecordNoSelectionRecordCommand } from '@/command-menu-item/record/no-selection/components/CreateNewIndexRecordNoSelectionRecordCommand';
import { AddToFavoritesSingleRecordCommand } from '@/command-menu-item/record/single-record/components/AddToFavoritesSingleRecordCommand';
import { DeleteSingleRecordCommand } from '@/command-menu-item/record/single-record/components/DeleteSingleRecordCommand';
import { DestroySingleRecordCommand } from '@/command-menu-item/record/single-record/components/DestroySingleRecordCommand';
import { RemoveFromFavoritesSingleRecordCommand } from '@/command-menu-item/record/single-record/components/RemoveFromFavoritesSingleRecordCommand';
import { RestoreSingleRecordCommand } from '@/command-menu-item/record/single-record/components/RestoreSingleRecordCommand';
import { DuplicateDashboardSingleRecordCommand } from '@/command-menu-item/record/single-record/dashboard/components/DuplicateDashboardSingleRecordCommand';
import { SaveDashboardSingleRecordCommand } from '@/command-menu-item/record/single-record/dashboard/components/SaveDashboardSingleRecordCommand';
import { SaveRecordPageLayoutSingleRecordCommand } from '@/command-menu-item/record/single-record/record-page-layout/components/SaveRecordPageLayoutSingleRecordCommand';
import { ActivateWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/ActivateWorkflowSingleRecordCommand';
import { DeactivateWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/DeactivateWorkflowSingleRecordCommand';
import { DiscardDraftWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/DiscardDraftWorkflowSingleRecordCommand';
import { DuplicateWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/DuplicateWorkflowSingleRecordCommand';
import { TestWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/TestWorkflowSingleRecordCommand';
import { TidyUpWorkflowSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow/components/TidyUpWorkflowSingleRecordCommand';
import { StopWorkflowRunSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow-runs/components/StopWorkflowRunSingleRecordCommand';
import { UseAsDraftWorkflowVersionSingleRecordCommand } from '@/command-menu-item/record/single-record/workflow-versions/components/UseAsDraftWorkflowVersionSingleRecordCommand';
import { EngineComponentKey } from '~/generated-metadata/graphql';

export const ENGINE_COMPONENT_KEY_COMPONENT_MAP: Record<
  EngineComponentKey,
  React.ReactNode
> = {
  [EngineComponentKey.CREATE_NEW_RECORD]: (
    <CreateNewIndexRecordNoSelectionRecordCommand />
  ),
  [EngineComponentKey.DELETE_SINGLE_RECORD]: <DeleteSingleRecordCommand />,
  [EngineComponentKey.DELETE_MULTIPLE_RECORDS]: (
    <DeleteMultipleRecordsCommand />
  ),
  [EngineComponentKey.RESTORE_SINGLE_RECORD]: <RestoreSingleRecordCommand />,
  [EngineComponentKey.RESTORE_MULTIPLE_RECORDS]: (
    <RestoreMultipleRecordsCommand />
  ),
  [EngineComponentKey.DESTROY_SINGLE_RECORD]: <DestroySingleRecordCommand />,
  [EngineComponentKey.DESTROY_MULTIPLE_RECORDS]: (
    <DestroyMultipleRecordsCommand />
  ),
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
  [EngineComponentKey.SAVE_RECORD_PAGE_LAYOUT]: (
    <SaveRecordPageLayoutSingleRecordCommand />
  ),
  [EngineComponentKey.SAVE_DASHBOARD_LAYOUT]: (
    <SaveDashboardSingleRecordCommand />
  ),
  [EngineComponentKey.TIDY_UP_WORKFLOW]: <TidyUpWorkflowSingleRecordCommand />,
};
