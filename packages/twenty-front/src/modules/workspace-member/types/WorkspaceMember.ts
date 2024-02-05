export type ColorScheme = 'Dark' | 'Light' | 'System';

export type WorkspaceMember = {
  id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  avatarUrl?: string | null;
  locale: string;
  colorScheme?: ColorScheme;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userId: string;
};
