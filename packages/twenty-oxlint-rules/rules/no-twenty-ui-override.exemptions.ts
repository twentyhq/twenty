export const TWENTY_UI_OVERRIDE_EXEMPTIONS = [
  {
    filePath:
      'packages/twenty-front/src/modules/activities/calendar/components/CalendarDayCardContent.tsx',
    reason: 'Card.Content day row layout and the animation for ended days',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/activities/components/ActivityList.tsx',
    reason: 'Card.Root scrolls inside a full-height activity list',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/activities/emails/components/EmailsCardContent.tsx',
    reason: 'Section.Root fills the widget height',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/auth/sign-in-up/components/SignInUpGlobalScopeForm.tsx',
    reason: 'Separator spacing inside the sign-in form',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/auth/sign-in-up/components/SignInUpWorkspaceScopeForm.tsx',
    reason: 'Separator spacing inside the sign-in form',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/front-components/media-session/components/FrontComponentMediaSessionIndicator.tsx',
    reason: 'Popover.Popup sized and spaced for the recording sessions list',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/log-console/components/LogConsoleDetailPanel.tsx',
    reason: 'Card.Root laid out as a padded error message block',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/log-console/components/LogConsoleFieldsCard.tsx',
    reason: 'Card.Root laid out as a padded column of log fields',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/log-console/components/LogConsoleRecordChangeDetail.tsx',
    reason: 'Button placement in its parent column',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/marketplace/components/SettingsApplicationInstallPermissionValidationModal.tsx',
    reason: 'LightButton pinned to the corner of the fullscreen dialog',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/navigation/components/MobileNavigationBar.tsx',
    reason:
      'IconButton sized as a 40px touch target with the current page fill',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/object-record/record-update-multiple/components/UpdateMultipleRecordsForm.tsx',
    reason: 'Section.Root laid out as the padded column of bulk edit fields',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/onboarding/components/OnboardingSkipDialog.tsx',
    reason: 'Dialog.Header centers the visual and anchors the close button',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/onboarding/components/free-credits/OnboardingFreeCreditsPill.tsx',
    reason: 'Popover.Popup width for the free credits breakdown',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/accounts/components/SettingsAccountsPasswordController.tsx',
    reason: 'Button placement in its parent column',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/admin-panel/health-status/components/SettingsAdminWorkspacesByHealthAccordion.tsx',
    reason: 'Card.Content laid out as the accordion header row',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/applications/components/SettingsApplicationOverviewCard.tsx',
    reason: 'Card.Root media layout with a minimum height',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/components/SettingsCard.tsx',
    reason:
      'Compact Card.Content column for the settings card header and description',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/components/SettingsListCard.tsx',
    reason: 'Card.Footer laid out around the add button',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/components/SettingsOptions/SettingsCardContentBase.tsx',
    reason: 'Card.Content laid out as a settings option row',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/components/SettingsTableCard.tsx',
    reason: 'Forwards the caller className to Card.Root',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/config-variables/components/ConfigVariableEdit.tsx',
    reason: 'Section.Header without trailing margin above the variable input',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/data-model/components/SettingsDataModelPreviewFormCard.tsx',
    reason: 'Tinted preview Card.Content and unpadded form Card.Content',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/data-model/components/SettingsDataModelPreviewMiniCard.tsx',
    reason: 'Compact Card.Content with primary text for field previews',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/data-model/fields/forms/select/components/SettingsDataModelFieldSelectForm.tsx',
    reason: 'Card.Footer laid out around the add option button',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/data-model/graph-overview/components/SettingsDataModelOverview.tsx',
    reason: 'React Flow panel classes on ButtonGroup',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/data-model/objects/forms/components/SettingsDataModelObjectSettingsFormCard.tsx',
    reason: 'Tinted preview Card.Content',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/event-logs/components/SettingsLogs.tsx',
    reason: 'Card.Content laid out as the column of log filters and results',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/mcp/components/SettingsMcpSetupCard.tsx',
    reason: 'One-off Card.Content row layout',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/spreadsheet-import/components/SpreadSheetImportModalWrapper.tsx',
    reason: 'Dialog.Popup keeps the xl height across import steps',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/spreadsheet-import/components/SpreadsheetImportStepBody.tsx',
    reason: 'Dialog.Body laid out as a full-height import step',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/spreadsheet-import/components/StepNavigationButton.tsx',
    reason: 'Dialog.Footer laid out as the import step navigation bar',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/ui/feedback/skeleton/components/SkeletonLine.tsx',
    reason: 'Forwards the caller className and style to Skeleton',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/ui/feedback/toast/components/AppToaster.tsx',
    reason: 'Toaster stacking order above the app layers',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/ui/input/components/FormFieldInputContainer.tsx',
    reason: 'Field.Root as a full-width column',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/ui/layout/dialog/components/DialogInstance.tsx',
    reason:
      'Runtime position and stacking of Dialog.Backdrop and Dialog.Viewport',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/ui/layout/tab-list/components/TabListRoot.tsx',
    reason: 'Tabs.Root rendered as a display contents adapter',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeButtonGroup.tsx',
    reason: 'React Flow nodrag and nopan classes on ButtonGroup',
  },
  {
    filePath:
      'packages/twenty-front/src/pages/settings/ai/SettingsAiPrompts.tsx',
    reason: 'Section.Header without trailing margin above the prompt form',
  },
] as const;
