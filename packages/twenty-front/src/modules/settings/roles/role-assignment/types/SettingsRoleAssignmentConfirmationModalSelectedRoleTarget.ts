export type SettingsRoleAssignmentConfirmationModalSelectedRoleTarget = {
  id: string;
  name: string;
  role?: { id: string; label: string };
  colorScheme?: string;
  userEmail?: string;
  entityType: 'workspaceMember' | 'agent' | 'apiKey';
};
