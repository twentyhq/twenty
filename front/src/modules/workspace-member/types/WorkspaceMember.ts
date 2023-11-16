export type ColorScheme = 'Dark' | 'Light' | 'System';

export type WorkspaceMember = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  locale: string;
  colorScheme: ColorScheme;
  allowImpersonation: boolean;
};
