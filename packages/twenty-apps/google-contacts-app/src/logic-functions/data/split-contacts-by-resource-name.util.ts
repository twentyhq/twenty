import { type ContactToUpdate } from 'src/logic-functions/types/contact-write.type';

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
