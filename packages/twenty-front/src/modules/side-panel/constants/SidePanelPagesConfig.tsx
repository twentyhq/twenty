import { SidePanelCommandMenuItemDisplayPage } from '@/command-menu-item/display/components/SidePanelCommandMenuItemDisplayPage';
import { SidePanelCommandMenuItemEditPage } from '@/command-menu-item/edit/components/SidePanelCommandMenuItemEditPage';
import { SidePanelNavigationMenuItemEditPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNavigationMenuItemEditPage';
import { SidePanelCoreWorkflowFiltersPage } from '@/object-core/workflows/components/SidePanelCoreWorkflowFiltersPage';
import { SidePanelCoreWorkflowVersionPage } from '@/object-core/workflows/versions/components/SidePanelCoreWorkflowVersionPage';
import { SidePanelCoreWorkflowVersionsPage } from '@/object-core/workflows/versions/components/SidePanelCoreWorkflowVersionsPage';
import { SidePanelSettingsMetadataTranslationsPage } from '@/settings/translations/components/SidePanelSettingsMetadataTranslationsPage';
import { SidePanelRoutedPage } from '@/side-panel/routing/components/SidePanelRoutedPage';
import { SidePanelNewSidebarItemPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemPage';
import { SidePanelEmailBlockSettingsPage } from '@/side-panel/pages/email-block-settings/components/SidePanelEmailBlockSettingsPage';
import { SidePanelAskAiPage } from '@/side-panel/pages/ask-ai/components/SidePanelAskAiPage';
import { SidePanelComposeEmailPage } from '@/side-panel/pages/compose-email/components/SidePanelComposeEmailPage';
import { SidePanelComposeCalendarEventPage } from '@/side-panel/pages/compose-calendar-event/components/SidePanelComposeCalendarEventPage';
import { SidePanelCreateRelatedRecordPage } from '@/side-panel/pages/create-related-record/components/SidePanelCreateRelatedRecordPage';
import { SidePanelSendCampaignPage } from '@/side-panel/pages/send-campaign/components/SidePanelSendCampaignPage';
import { SidePanelSendCampaignTestPage } from '@/side-panel/pages/send-campaign-test/components/SidePanelSendCampaignTestPage';
import { SidePanelFrontComponentPage } from '@/side-panel/pages/front-component/components/SidePanelFrontComponentPage';
import { SidePanelDashboardChartSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardChartSettings';
import { SidePanelDashboardIframeSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardIframeSettings';
import { SidePanelDashboardRecordTableSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardRecordTableSettings';
import { SidePanelRecordPageFieldSettings } from '@/side-panel/pages/page-layout/components/record-page/SidePanelRecordPageFieldSettings';
import { SidePanelRecordPageFieldsSettings } from '@/side-panel/pages/page-layout/components/record-page/SidePanelRecordPageFieldsSettings';
import { SidePanelPageLayoutDashboardWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutDashboardWidgetTypeSelect';
import { SidePanelPageLayoutRecordPageWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutRecordPageWidgetTypeSelect';
import { SidePanelPageLayoutTabSettings } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutTabSettings';
import { SidePanelPageLayoutWidgetSettings } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutWidgetSettings';
import { SidePanelMergeRecordPage } from '@/side-panel/pages/record-page/components/SidePanelMergeRecordPage';
import { SidePanelUpdateMultipleRecords } from '@/side-panel/pages/record-page/components/SidePanelUpdateMultipleRecords';
import { SidePanelEditRichTextPage } from '@/side-panel/pages/rich-text-page/components/SidePanelEditRichTextPage';
import { SidePanelSearchRecordsPage } from '@/side-panel/pages/search/components/SidePanelSearchRecordsPage';
import { SidePanelWorkflowCreateStep } from '@/side-panel/pages/workflow/step/create/components/SidePanelWorkflowCreateStep';
import { SidePanelWorkflowEditStep } from '@/side-panel/pages/workflow/step/edit/components/SidePanelWorkflowEditStep';
import { SidePanelWorkflowStepSettings } from '@/side-panel/pages/workflow/step/settings/components/SidePanelWorkflowStepSettings';
import { SidePanelWorkflowEditStepType } from '@/side-panel/pages/workflow/step/edit/components/SidePanelWorkflowEditStepType';
import { SidePanelWorkflowRunViewStep } from '@/side-panel/pages/workflow/step/view-run/components/SidePanelWorkflowRunViewStep';
import { SidePanelWorkflowViewStep } from '@/side-panel/pages/workflow/step/view/components/SidePanelWorkflowViewStep';
import { SidePanelWorkflowSelectTriggerType } from '@/side-panel/pages/workflow/trigger-type/components/SidePanelWorkflowSelectTriggerType';
import { type ActiveSidePanelPage } from '@/side-panel/types/SidePanelPage';
import { SidePanelPages } from 'twenty-shared/types';

export const SIDE_PANEL_PAGES_CONFIG = new Map<
  ActiveSidePanelPage,
  React.ReactNode
>([
  [SidePanelPages.CommandMenuDisplay, <SidePanelCommandMenuItemDisplayPage />],
  [SidePanelPages.MergeRecords, <SidePanelMergeRecordPage />],
  [SidePanelPages.UpdateRecords, <SidePanelUpdateMultipleRecords />],
  [SidePanelPages.EditRichText, <SidePanelEditRichTextPage />],
  [
    SidePanelPages.WorkflowTriggerSelectType,
    <SidePanelWorkflowSelectTriggerType />,
  ],
  [SidePanelPages.WorkflowStepCreate, <SidePanelWorkflowCreateStep />],
  [SidePanelPages.WorkflowStepEditType, <SidePanelWorkflowEditStepType />],
  [SidePanelPages.WorkflowStepEdit, <SidePanelWorkflowEditStep />],
  [SidePanelPages.WorkflowStepSettings, <SidePanelWorkflowStepSettings />],
  [SidePanelPages.WorkflowStepView, <SidePanelWorkflowViewStep />],
  [SidePanelPages.WorkflowRunStepView, <SidePanelWorkflowRunViewStep />],
  [SidePanelPages.SearchRecords, <SidePanelSearchRecordsPage />],
  [SidePanelPages.AskAI, <SidePanelAskAiPage />],
  [
    SidePanelPages.PageLayoutDashboardWidgetTypeSelect,
    <SidePanelPageLayoutDashboardWidgetTypeSelect />,
  ],
  [SidePanelPages.DashboardChartSettings, <SidePanelDashboardChartSettings />],
  [
    SidePanelPages.DashboardIframeSettings,
    <SidePanelDashboardIframeSettings />,
  ],
  [SidePanelPages.PageLayoutTabSettings, <SidePanelPageLayoutTabSettings />],
  [
    SidePanelPages.PageLayoutWidgetSettings,
    <SidePanelPageLayoutWidgetSettings />,
  ],
  [
    SidePanelPages.DashboardRecordTableSettings,
    <SidePanelDashboardRecordTableSettings />,
  ],
  [
    SidePanelPages.RecordPageFieldsSettings,
    <SidePanelRecordPageFieldsSettings />,
  ],
  [
    SidePanelPages.RecordPageFieldSettings,
    <SidePanelRecordPageFieldSettings />,
  ],
  [SidePanelPages.ViewFrontComponent, <SidePanelFrontComponentPage />],
  [
    SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
    <SidePanelPageLayoutRecordPageWidgetTypeSelect />,
  ],
  [
    SidePanelPages.NavigationMenuItemEdit,
    <SidePanelNavigationMenuItemEditPage />,
  ],
  [SidePanelPages.NavigationMenuAddItem, <SidePanelNewSidebarItemPage />],
  [SidePanelPages.CommandMenuEdit, <SidePanelCommandMenuItemEditPage />],
  [SidePanelPages.ComposeCalendarEvent, <SidePanelComposeCalendarEventPage />],
  [SidePanelPages.ComposeEmail, <SidePanelComposeEmailPage />],
  [SidePanelPages.CreateRelatedRecord, <SidePanelCreateRelatedRecordPage />],
  [SidePanelPages.SendCampaign, <SidePanelSendCampaignPage />],
  [SidePanelPages.SendCampaignTest, <SidePanelSendCampaignTestPage />],
  [SidePanelPages.EmailBlockSettings, <SidePanelEmailBlockSettingsPage />],
  [
    SidePanelPages.SettingsMetadataTranslations,
    <SidePanelSettingsMetadataTranslationsPage />,
  ],
  [SidePanelPages.RoutedPage, <SidePanelRoutedPage />],
  [SidePanelPages.WorkflowCoreFilters, <SidePanelCoreWorkflowFiltersPage />],
  [SidePanelPages.WorkflowVersions, <SidePanelCoreWorkflowVersionsPage />],
  [SidePanelPages.WorkflowVersion, <SidePanelCoreWorkflowVersionPage />],
]);
