export type TeamsUserSearchOption = {
  teamsUserAadObjectId: string;
  displayName: string | undefined;
  email: string | undefined;
};

export type TeamsUserSearchResult =
  | { success: true; teamsUsers: TeamsUserSearchOption[] }
  | { success: false; message: string; error: string };

export type TeamsUnlinkedUsersResult =
  | (Extract<TeamsUserSearchResult, { success: true }> & { hasMore: boolean })
  | Extract<TeamsUserSearchResult, { success: false }>;
