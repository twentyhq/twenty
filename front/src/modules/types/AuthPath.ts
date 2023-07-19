export enum AuthPath {
  Index = '',
  Verify = 'verify',
  SignIn = 'sign-in',
  SignUp = 'sign-up',
  Invite = 'invite/:workspaceInviteHash',
  CreateWorkspace = 'create/workspace',
  CreateProfile = 'create/profile',
}
