export const TWENTY_UI_OVERRIDE_EXEMPTIONS = [
  {
    filePath:
      'packages/twenty-front/src/modules/activities/calendar/components/CalendarDayCardContent.tsx',
    siteIds: ['S001'],
    reason: 'Card.Content animation for calendar days that have ended',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/activities/emails/components/EmailsCardContent.tsx',
    siteIds: ['S006'],
    reason: 'Section.Root fills the widget height',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/auth/sign-in-up/components/SignInUpWorkspaceScopeForm.tsx',
    siteIds: ['S018'],
    reason: 'Separator spacing inside the sign-in form',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/log-console/components/LogConsoleDetailPanel.tsx',
    siteIds: ['S027'],
    reason: 'Card.Root laid out as a padded error message block',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/log-console/components/LogConsoleRecordChangeDetail.tsx',
    siteIds: ['S029'],
    reason: 'Button placement in its parent column',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/accounts/components/SettingsAccountsPasswordController.tsx',
    siteIds: ['S077'],
    reason: 'Button placement in its parent column',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/applications/components/SettingsApplicationOverviewCard.tsx',
    siteIds: ['S092'],
    reason: 'Card.Root media layout with a minimum height',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/components/SettingsOptions/SettingsOptionCardContentSwitch.tsx',
    siteIds: ['S105'],
    reason: 'Advanced mode color on the Switch',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/components/SettingsTableCard.tsx',
    siteIds: ['S107'],
    reason: 'Forwards the caller className to Card.Root',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/settings/mcp-and-apis/components/SettingsMcpSetupCard.tsx',
    siteIds: ['S123'],
    reason: 'One-off Card.Content row layout',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/ui/feedback/skeleton/components/SkeletonLine.tsx',
    siteIds: ['S153', 'S154'],
    reason: 'Forwards the caller className and style to Skeleton',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/ui/feedback/toast/components/AppToaster.tsx',
    siteIds: ['S155'],
    reason: 'Toaster stacking order above the app layers',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/ui/input/components/FormFieldInputContainer.tsx',
    siteIds: ['S164'],
    reason: 'Field.Root as a full-width column',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/ui/layout/dialog/components/DialogInstance.tsx',
    siteIds: ['S178', 'S179'],
    reason:
      'Runtime position and stacking of Dialog.Backdrop and Dialog.Viewport',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/ui/layout/tab-list/components/TabListRoot.tsx',
    siteIds: ['S185'],
    reason: 'Tabs.Root rendered as a display contents adapter',
  },
  {
    filePath:
      'packages/twenty-front/src/modules/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeButtonGroup.tsx',
    siteIds: ['S197'],
    reason: 'React Flow nodrag and nopan classes on ButtonGroup',
  },
  {
    filePath:
      'packages/twenty-front/src/pages/settings/ai/SettingsAiPrompts.tsx',
    siteIds: ['S210'],
    reason: 'Section.Header without trailing margin above the prompt form',
  },
] as const;
