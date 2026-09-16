import { type GoogleContactWriteInput } from 'src/logic-functions/types/google-request.type';
import { type Person } from 'src/logic-functions/types/google-response.type';
import { type TwentyPersonRecord } from 'src/logic-functions/types/twenty-person.type';

export type ContactToCreate = {
  person: TwentyPersonRecord;
  contact: GoogleContactWriteInput;
};

export type ContactToUpdate = ContactToCreate & {
  existingContact: Person;
};

export type CreatedContact = {
  personId: string;
  resourceName: string;
};
