export type Traceable = {
  __typename: 'Traceable';
  id: string;
  name: string;
  websiteUrl: {
    __typename?: 'Links';
    primaryLinkUrl: string;
    primaryLinkLabel: string;
  } | null;
  campaignName: string | null;
  campaignSource: string | null;
  meansOfCommunication: string | null;
  keyword: string | null;
  campaignContent: string | null;
  generatedUrl: {
    __typename?: 'Links';
    primaryLinkUrl: string;
    primaryLinkLabel: string;
  } | null;
  url: {
    __typename?: 'Links';
    primaryLinkUrl: string;
    primaryLinkLabel: string;
  } | null;
  position: number | null;
};
