export type PublicWebPage = {
  url: string;
  finalUrl: string | null;
  status: number | null;
  isTimeout: boolean;
  html: string | null;
  errorMessage: string | null;
};
