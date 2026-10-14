export const TWENTY_UI_OVERRIDE_EXEMPTIONS = [
  {
    filePath:
      'packages/twenty-front/src/modules/activities/calendar/components/CalendarDayCardContent.tsx',
    reason: 'Card.Content animation for calendar days that have ended',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/activities/emails/components/EmailsCardContent.tsx',
    reason: 'Section.Root fills the widget height',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/auth/sign-in-up/components/SignInUpWorkspaceScopeForm.tsx',
    reason: 'Separator spacing inside the sign-in form',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/log-console/components/LogConsoleDetailPanel.tsx',
    reason: 'Card.Root laid out as a padded error message block',
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
      'packages/twenty-front/src/modules/settings/accounts/components/SettingsAccountsPasswordController.tsx',
    reason: 'Button placement in its parent column',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/applications/components/SettingsApplicationOverviewCard.tsx',
    reason: 'Card.Root media layout with a minimum height',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/components/SettingsOptions/SettingsOptionCardContentSwitch.tsx',
    reason: 'Advanced mode color on the Switch',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/components/SettingsTableCard.tsx',
    reason: 'Forwards the caller className to Card.Root',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/data-model/graph-overview/components/SettingsDataModelOverview.tsx',
    reason: 'React Flow panel classes on ButtonGroup',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/mcp-and-apis/components/SettingsMcpSetupCard.tsx',
    reason: 'One-off Card.Content row layout',
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
