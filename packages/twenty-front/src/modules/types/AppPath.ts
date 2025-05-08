export enum AppPath {
  // Not logged-in
  Verify = '/verify',
  VerifyEmail = '/verify-email',
  SignInUp = '/welcome',
  Invite = '/invite/:workspaceInviteHash',
  ResetPassword = '/reset-password/:passwordResetToken',

  // Onboarding
  CreateWorkspace = '/create/workspace',
  CreateProfile = '/create/profile',
  SyncEmails = '/sync/emails',
  InviteTeam = '/invite-team',
  PlanRequired = '/plan-required',
  PaymentRequired = '/payment-required',
  PaymentRequiredSuccess = '/payment-required/payment-success',

  // Onboarded
  Index = '/',
  TasksPage = '/objects/tasks',
  OpportunitiesPage = '/objects/opportunities',

  ChargesPage = '/objects/charges',
  TraceablePage = '/objects/traceable',
  LinkLogsPage = '/objects/linklogs',
  IntegrationsPage = '/objects/integrations',

  RecordIndexPage = '/objects/:objectNamePlural',
  RecordShowPage = '/object/:objectNameSingular/:objectRecordId',

  Settings = `settings`,
  SettingsCatchAll = `/${Settings}/*`,
  Developers = `developers`,
  DevelopersCatchAll = `/${Developers}/*`,

  InternalChat = '/chat/internal',
  ExternalChat = '/chat/call-center',

  Chatbot = '/chatbot',
  DashboardLinks = '/dashboard-links',

  Authorize = '/authorize',

  // 404 page not found
  NotFoundWildcard = '*',
  NotFound = '/not-found',
}
