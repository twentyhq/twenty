import { AppPath } from 'twenty-shared/types';

export const buildAdminConsoleSignInUrl = ({
  adminConsoleUrl,
  loginToken,
  returnToPath,
}: {
  adminConsoleUrl: string;
  loginToken: string;
  returnToPath: string;
}): string => {
  const adminConsoleSignInUrl = new URL(AppPath.Verify, adminConsoleUrl);

  adminConsoleSignInUrl.searchParams.set('loginToken', loginToken);
  adminConsoleSignInUrl.searchParams.set('returnToPath', returnToPath);

  return adminConsoleSignInUrl.toString();
};
