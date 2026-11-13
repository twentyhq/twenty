export type GraphUser = {
  id?: string;
  displayName?: string;
  givenName?: string;
  surname?: string;
  mail?: string;
  userPrincipalName?: string;
};

export type LinkableGraphUser = GraphUser & { id: string };
