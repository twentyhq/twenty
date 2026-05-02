export type FrontendApplicationOAuthProvider = {
  id: string;
  applicationId: string;
  name: string;
  displayName: string;
  icon: string | null;
  scopes: string[];
};
