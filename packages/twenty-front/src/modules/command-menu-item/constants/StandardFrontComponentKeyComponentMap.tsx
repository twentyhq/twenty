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
import { StandardFrontComponentKey } from '~/generated-metadata/graphql';

export const STANDARD_FRONT_COMPONENT_KEY_COMPONENT_MAP: Record<
  StandardFrontComponentKey,
  React.ReactNode
> = {
  [StandardFrontComponentKey.CREATE_NEW_RECORD]: (
    <CreateNewIndexRecordNoSelectionRecordCommand />
  ),
  [StandardFrontComponentKey.DELETE_SINGLE_RECORD]: (
    <DeleteSingleRecordCommand />
  ),
  [StandardFrontComponentKey.DELETE_MULTIPLE_RECORDS]: (
    <DeleteMultipleRecordsCommand />
  ),
  [StandardFrontComponentKey.RESTORE_SINGLE_RECORD]: (
    <RestoreSingleRecordCommand />
  ),
  [StandardFrontComponentKey.RESTORE_MULTIPLE_RECORDS]: (
    <RestoreMultipleRecordsCommand />
  ),
  [StandardFrontComponentKey.DESTROY_SINGLE_RECORD]: (
    <DestroySingleRecordCommand />
  ),
  [StandardFrontComponentKey.DESTROY_MULTIPLE_RECORDS]: (
    <DestroyMultipleRecordsCommand />
  ),
  [StandardFrontComponentKey.ADD_TO_FAVORITES]: (
    <AddToFavoritesSingleRecordCommand />
  ),
  [StandardFrontComponentKey.REMOVE_FROM_FAVORITES]: (
    <RemoveFromFavoritesSingleRecordCommand />
  ),
  [StandardFrontComponentKey.MERGE_MULTIPLE_RECORDS]: (
    <MergeMultipleRecordsCommand />
  ),
  [StandardFrontComponentKey.DUPLICATE_DASHBOARD]: (
    <DuplicateDashboardSingleRecordCommand />
  ),
  [StandardFrontComponentKey.DUPLICATE_WORKFLOW]: (
    <DuplicateWorkflowSingleRecordCommand />
  ),
  [StandardFrontComponentKey.ACTIVATE_WORKFLOW]: (
    <ActivateWorkflowSingleRecordCommand />
  ),
  [StandardFrontComponentKey.DEACTIVATE_WORKFLOW]: (
    <DeactivateWorkflowSingleRecordCommand />
  ),
  [StandardFrontComponentKey.DISCARD_DRAFT_WORKFLOW]: (
    <DiscardDraftWorkflowSingleRecordCommand />
  ),
  [StandardFrontComponentKey.TEST_WORKFLOW]: (
    <TestWorkflowSingleRecordCommand />
  ),
  [StandardFrontComponentKey.STOP_WORKFLOW_RUN]: (
    <StopWorkflowRunSingleRecordCommand />
  ),
  [StandardFrontComponentKey.USE_AS_DRAFT_WORKFLOW_VERSION]: (
    <UseAsDraftWorkflowVersionSingleRecordCommand />
  ),
  [StandardFrontComponentKey.SAVE_RECORD_PAGE_LAYOUT]: (
    <SaveRecordPageLayoutSingleRecordCommand />
  ),
  [StandardFrontComponentKey.SAVE_DASHBOARD_LAYOUT]: (
    <SaveDashboardSingleRecordCommand />
  ),
  [StandardFrontComponentKey.TIDY_UP_WORKFLOW]: (
    <TidyUpWorkflowSingleRecordCommand />
  ),
};
