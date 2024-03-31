export enum AppPath {
  // Not logged-in
  Verify = '/verify',
  SignInUp = '/welcome',
  Invite = '/invite/:workspaceInviteHash',
  ResetPassword = '/reset-password/:passwordResetToken',

  // Onboarding
  CreateWorkspace = '/create/workspace',
  CreateProfile = '/create/profile',
  PlanRequired = '/plan-required',
  PlanRequiredSuccess = '/plan-required/payment-success',

  // Onboarded
  Index = '/',
  TasksPage = '/tasks',
  OpportunitiesPage = '/objects/opportunities',

  RecordIndexPage = '/objects/:objectNamePlural',
  RecordShowPage = '/object/:objectNameSingular/:objectRecordId',

  SettingsCatchAll = `/settings/*`,
  DevelopersCatchAll = `/developers/*`,

  // Impersonate
  Impersonate = '/impersonate/:userId',

  Authorize = '/authorize',

  // 404 page not found
  NotFoundWildcard = '*',
  NotFound = '/not-found',
}
