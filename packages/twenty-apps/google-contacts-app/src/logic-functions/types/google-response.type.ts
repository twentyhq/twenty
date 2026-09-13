export type EmailAddress = {
  value?: string;
};

export type Name = {
  givenName?: string;
  familyName?: string;
  displayName?: string;
  displayNameLastFirst?: string;
};

export type Organization = {
  name?: string;
  title?: string;
  domain?: string;
};

export type PhoneNumber = {
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

type PersonSource = {
  updateTime?: string;
};

type PersonMetadata = {
  deleted?: boolean;
  previousResourceNames?: string[];
  sources?: PersonSource[];
};

export type Person = {
  emailAddresses?: EmailAddress[];
  // Required by updateContact to detect concurrent edits
  etag?: string;
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

type GoogleRpcStatus = {
  code?: number;
  message?: string;
};

export type PersonResponse = {
  person?: Person;
  requestedResourceName?: string;
  // Per-contact outcome of a batch mutation: absent or zero means success
  status?: GoogleRpcStatus;
};

export type BatchGetContactsResponse = {
  responses?: PersonResponse[];
};

export type BatchCreateContactsResponse = {
  createdPeople?: PersonResponse[];
};

export type BatchUpdateContactsResponse = {
  updateResult?: Record<string, PersonResponse>;
};
