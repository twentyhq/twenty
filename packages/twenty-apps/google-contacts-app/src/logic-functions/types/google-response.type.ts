type EmailAddress = {
  value: string;
}

type Name = {
  displayNameLastFirst: string;
}

type Organization = {
  name?: string;
  title?: string;
}

type PhoneNumber = {
  // Canonicalized ITU-T E.164 form.
  canonicalForm: string;
}

type Photo = {
  default: boolean;
  url: string;
}

type Url = {
  value: string;
}

type PersonMetadata = {
  deleted?: boolean;
  previousResourceNames?: string[];
}

export type Person = {
  emailAddresses?: EmailAddress[];
  metadata?: PersonMetadata;
  names: Name[];
  organizations?: Organization[];
  phoneNumbers?: PhoneNumber[];
  photos: Photo[];
  resourceName: string;
  urls?: Url[];
}

export type ListConnectionsResponse = {
  connections: Person[];
  nextPageToken?: string;
  nextSyncToken: string;
  totalItems: number;
}