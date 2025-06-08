export type Carrier = {
  __typename: 'Carrier';
  id: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  name: string;
  domainName: {
    __typename?: 'Links';
    primaryLinkUrl: string;
    primaryLinkLabel: string;
    secondaryLinks: never[] | [];
  };
  location: string;
  favorites?: {
    __typename?: 'Favorite';
    id: string;
  }[];
  timelineActivities?: {
    __typename?: 'TimelineActivity';
    id: string;
  }[];
};