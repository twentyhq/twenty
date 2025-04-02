export type SettingsRoleAssignmentConfirmationModalSelectedWorkspaceMember = {
  id: string;
  name: string;
  role?: { id: string; label: string };
  avatarUrl?: string | null;
  colorScheme?: string;
  userEmail?: string;
};
