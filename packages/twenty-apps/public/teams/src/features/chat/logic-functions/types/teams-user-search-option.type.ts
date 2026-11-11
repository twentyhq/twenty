export type TeamsUserSearchOption = {
  teamsUserAadObjectId: string;
  displayName: string | undefined;
  email: string | undefined;
};

export type TeamsUserSearchResult =
  | { success: true; teamsUsers: TeamsUserSearchOption[] }
  | { success: false; message: string; error: string };

export type TeamsUnlinkedUsersResult =
  | { success: true; teamsUsers: TeamsUserSearchOption[]; hasMore: boolean }
  | { success: false; message: string; error: string };
