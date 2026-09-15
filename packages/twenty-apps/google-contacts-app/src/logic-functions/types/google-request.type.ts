import {
  type EmailAddress,
  type Name,
  type Organization,
  type PersonUrl,
  type PhoneNumber,
} from 'src/logic-functions/types/google-response.type';

export type GoogleContactWriteInput = {
  emailAddresses: EmailAddress[];
  names: Name[];
  organizations: Organization[];
  phoneNumbers: PhoneNumber[];
  urls: PersonUrl[];
};

export type GoogleContactUpdateInput = GoogleContactWriteInput & {
  etag?: string;
};

export type BatchCreateContactsRequest = {
  contacts: { contactPerson: GoogleContactWriteInput }[];
  readMask: string;
};

export type BatchUpdateContactsRequest = {
  contacts: Record<string, GoogleContactUpdateInput>;
  updateMask: string;
  readMask: string;
};
