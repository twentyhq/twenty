import {
  type EmailAddress,
  type Name,
  type Organization,
  type PersonUrl,
  type PhoneNumber,
} from 'src/logic-functions/types/google-response.type';

// Only the fields Twenty owns. Keys left out stay untouched in Google because
// they are also left out of the updatePersonFields mask.
export type GoogleContactWriteInput = {
  emailAddresses?: EmailAddress[];
  names?: Name[];
  organizations?: Organization[];
  phoneNumbers?: PhoneNumber[];
  urls?: PersonUrl[];
};
