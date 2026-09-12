type EmailAddress = {
  value?: string;
};

type Name = {
  givenName?: string;
  familyName?: string;
  displayName?: string;
  displayNameLastFirst?: string;
};

type Organization = {
  name?: string;
  title?: string;
};

type PhoneNumber = {
  value?: string;
  // Canonicalized ITU-T E.164 form
  canonicalForm?: string;
};

type Photo = {
  default?: boolean;
  url?: string;
};

export type PersonUrl = {
  value?: string;
};

type PersonMetadata = {
  deleted?: boolean;
  previousResourceNames?: string[];
};

export type Person = {
  emailAddresses?: EmailAddress[];
  metadata?: PersonMetadata;
  names?: Name[];
  organizations?: Organization[];
  phoneNumbers?: PhoneNumber[];
  photos?: Photo[];
  resourceName: string;
  urls?: PersonUrl[];
};

export type ListConnectionsResponse = {
  connections?: Person[];
  nextPageToken?: string;
  nextSyncToken?: string;
  totalItems?: number;
};
