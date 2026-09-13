import { type GoogleContactWriteInput } from 'src/logic-functions/types/google-request.type';

export const groupByUpdateMask = <TContact extends { contact: GoogleContactWriteInput }>(
  contacts: TContact[],
): Map<string, TContact[]> => {
  const contactsByUpdateMask = new Map<string, TContact[]>();

  for (const contactToUpdate of contacts) {
    const updateMask = Object.keys(contactToUpdate.contact).sort().join(',');
    const group = contactsByUpdateMask.get(updateMask) ?? [];

    group.push(contactToUpdate);
    contactsByUpdateMask.set(updateMask, group);
  }

  return contactsByUpdateMask;
};
