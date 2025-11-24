import { ActionLink } from '@/action-menu/actions/components/ActionLink';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { NoSelectionWorkflowRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/workflow-actions/types/NoSelectionWorkflowRecordActionKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { SeeRunsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/components/SeeRunsWorkflowVersionSingleRecordAction';
import { SeeVersionsWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/components/SeeVersionsWorkflowVersionSingleRecordAction';
import { SeeWorkflowWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/components/SeeWorkflowWorkflowVersionSingleRecordAction';
import { UseAsDraftWorkflowVersionSingleRecordAction } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/components/UseAsDraftWorkflowVersionSingleRecordAction';
import { WorkflowVersionSingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/workflow-version-actions/types/WorkflowVersionSingleRecordActionsKeys';
import { inheritActionsFromDefaultConfig } from '@/action-menu/actions/record-actions/utils/inheritActionsFromDefaultConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { msg } from '@lingui/core/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconHistoryToggle,
  IconPencil,
  IconSettingsAutomation,
  IconVersions,
} from 'twenty-ui/display';

export const WORKFLOW_VERSIONS_ACTIONS_CONFIG = inheritActionsFromDefaultConfig(
  {
    config: {
      [WorkflowVersionSingleRecordActionKeys.SEE_RUNS]: {
        key: WorkflowVersionSingleRecordActionKeys.SEE_RUNS,
        label: msg`See runs`,
        shortLabel: msg`See runs`,
        position: 1,
        isPinned: true,
        type: ActionType.Standard,
        scope: ActionScope.RecordSelection,
        Icon: IconHistoryToggle,
        shouldBeRegistered: ({ workflowWithCurrentVersion }) =>
          isDefined(workflowWithCurrentVersion),
        availableOn: [
          ActionViewType.SHOW_PAGE,
          ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <SeeRunsWorkflowVersionSingleRecordAction />,
      },
      [WorkflowVersionSingleRecordActionKeys.SEE_WORKFLOW]: {
        key: WorkflowVersionSingleRecordActionKeys.SEE_WORKFLOW,
        label: msg`See workflow`,
        shortLabel: msg`See workflow`,
        position: 2,
        isPinned: true,
        type: ActionType.Standard,
        scope: ActionScope.RecordSelection,
        Icon: IconSettingsAutomation,
        shouldBeRegistered: ({ selectedRecord }) =>
          isDefined(selectedRecord?.workflow?.id),
        availableOn: [
          ActionViewType.SHOW_PAGE,
          ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <SeeWorkflowWorkflowVersionSingleRecordAction />,
      },
      [WorkflowVersionSingleRecordActionKeys.USE_AS_DRAFT]: {
        key: WorkflowVersionSingleRecordActionKeys.USE_AS_DRAFT,
        label: msg`Use as draft`,
        shortLabel: msg`Use as draft`,
        position: 3,
        isPinned: true,
        type: ActionType.Standard,
        scope: ActionScope.RecordSelection,
        Icon: IconPencil,
        shouldBeRegistered: ({ selectedRecord }) =>
          isDefined(selectedRecord) && selectedRecord.status !== 'DRAFT',
        availableOn: [
          ActionViewType.SHOW_PAGE,
          ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <UseAsDraftWorkflowVersionSingleRecordAction />,
      },
      [WorkflowVersionSingleRecordActionKeys.SEE_VERSIONS]: {
        key: WorkflowVersionSingleRecordActionKeys.SEE_VERSIONS,
        label: msg`See versions history`,
        shortLabel: msg`See versions`,
        position: 4,
        type: ActionType.Standard,
        scope: ActionScope.RecordSelection,
        Icon: IconVersions,
        shouldBeRegistered: ({ workflowWithCurrentVersion }) =>
          isDefined(workflowWithCurrentVersion),
        availableOn: [
          ActionViewType.SHOW_PAGE,
          ActionViewType.INDEX_PAGE_SINGLE_RECORD_SELECTION,
        ],
        component: <SeeVersionsWorkflowVersionSingleRecordAction />,
      },
      [NoSelectionWorkflowRecordActionKeys.GO_TO_RUNS]: {
        type: ActionType.Navigation,
        scope: ActionScope.Global,
        key: NoSelectionWorkflowRecordActionKeys.GO_TO_RUNS,
        label: msg`Go to runs`,
        shortLabel: msg`See runs`,
        position: 14,
        Icon: IconHistoryToggle,
        accent: 'default',
        isPinned: true,
        shouldBeRegistered: () => true,
        availableOn: [ActionViewType.INDEX_PAGE_NO_SELECTION],
        component: (
          <ActionLink
            to={AppPath.RecordIndexPage}
            params={{ objectNamePlural: CoreObjectNamePlural.WorkflowRun }}
          />
        ),
      },
    },
    actionKeys: [
      SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD,
      SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD,
      SingleRecordActionKeys.ADD_TO_FAVORITES,
      SingleRecordActionKeys.REMOVE_FROM_FAVORITES,
      SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX,
      SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW,
      MultipleRecordsActionKeys.EXPORT,
      NoSelectionRecordActionKeys.EXPORT_VIEW,
      NoSelectionRecordActionKeys.SEE_DELETED_RECORDS,
      NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS,
      NoSelectionRecordActionKeys.GO_TO_WORKFLOWS,
      NoSelectionRecordActionKeys.GO_TO_PEOPLE,
      NoSelectionRecordActionKeys.GO_TO_COMPANIES,
      NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES,
      NoSelectionRecordActionKeys.GO_TO_DASHBOARDS,
      NoSelectionRecordActionKeys.GO_TO_SETTINGS,
      NoSelectionRecordActionKeys.GO_TO_TASKS,
      NoSelectionRecordActionKeys.GO_TO_NOTES,
    ],
    propertiesToOverwrite: {
      [SingleRecordActionKeys.ADD_TO_FAVORITES]: {
        position: 5,
        isPinned: false,
      },
      [SingleRecordActionKeys.REMOVE_FROM_FAVORITES]: {
        position: 6,
        isPinned: false,
      },
      [SingleRecordActionKeys.EXPORT_FROM_RECORD_INDEX]: {
        position: 7,
        label: msg`Export version`,
      },
      [SingleRecordActionKeys.EXPORT_FROM_RECORD_SHOW]: {
        position: 7,
        label: msg`Export version`,
      },
      [MultipleRecordsActionKeys.EXPORT]: {
        position: 8,
        label: msg`Export versions`,
      },
      [NoSelectionRecordActionKeys.EXPORT_VIEW]: {
        position: 9,
      },
      [NoSelectionRecordActionKeys.SEE_DELETED_RECORDS]: {
        position: 10,
      },
      [NoSelectionRecordActionKeys.HIDE_DELETED_RECORDS]: {
        position: 11,
      },
      [SingleRecordActionKeys.NAVIGATE_TO_PREVIOUS_RECORD]: {
        position: 12,
        label: msg`Navigate to previous version`,
      },
      [SingleRecordActionKeys.NAVIGATE_TO_NEXT_RECORD]: {
        position: 13,
        label: msg`Navigate to next version`,
      },
      [NoSelectionRecordActionKeys.GO_TO_WORKFLOWS]: {
        position: 15,
        isPinned: true,
      },
      [NoSelectionRecordActionKeys.GO_TO_PEOPLE]: {
        position: 16,
      },
      [NoSelectionRecordActionKeys.GO_TO_COMPANIES]: {
        position: 17,
      },
      [NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES]: {
        position: 18,
      },
      [NoSelectionRecordActionKeys.GO_TO_DASHBOARDS]: {
        position: 19,
      },
      [NoSelectionRecordActionKeys.GO_TO_SETTINGS]: {
        position: 20,
      },
      [NoSelectionRecordActionKeys.GO_TO_TASKS]: {
        position: 21,
      },
      [NoSelectionRecordActionKeys.GO_TO_NOTES]: {
        position: 22,
      },
    },
  },
);
