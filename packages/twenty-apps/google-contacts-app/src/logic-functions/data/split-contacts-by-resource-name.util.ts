import { type ContactToUpdate } from 'src/logic-functions/types/contact-write.type';

// batchUpdateContacts keys its request and its response by resource name, so
// two people whose Google contacts were merged would collapse into one entry
// and one update would be lost. Only the first of each name goes into the
// request; the rest are reported by the caller.
export const splitContactsByResourceName = (
  contactsToUpdate: ContactToUpdate[],
): {
  uniqueContacts: ContactToUpdate[];
  collidingContacts: ContactToUpdate[];
} => {
  const seenResourceNames = new Set<string>();
  const uniqueContacts: ContactToUpdate[] = [];
  const collidingContacts: ContactToUpdate[] = [];

  for (const contactToUpdate of contactsToUpdate) {
    const resourceName = contactToUpdate.existingContact.resourceName;

    if (seenResourceNames.has(resourceName)) {
      collidingContacts.push(contactToUpdate);

      continue;
    }

    seenResourceNames.add(resourceName);
    uniqueContacts.push(contactToUpdate);
  }

  return { uniqueContacts, collidingContacts };
};
