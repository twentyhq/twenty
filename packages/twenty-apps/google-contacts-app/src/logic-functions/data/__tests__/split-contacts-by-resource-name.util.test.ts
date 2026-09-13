import { describe, expect, it } from 'vitest';

import { splitContactsByResourceName } from 'src/logic-functions/data/split-contacts-by-resource-name.util';
import { type ContactToUpdate } from 'src/logic-functions/types/contact-write.type';

const buildContactToUpdate = (
  personId: string,
  resourceName: string,
): ContactToUpdate =>
  ({
    person: { id: personId },
    contact: { names: [{ givenName: personId }] },
    existingContact: { resourceName, etag: 'etag' },
  }) as ContactToUpdate;

describe('splitContactsByResourceName', () => {
  it('should keep every contact when the resource names differ', () => {
    const contacts = [
      buildContactToUpdate('p1', 'people/1'),
      buildContactToUpdate('p2', 'people/2'),
    ];

    expect(splitContactsByResourceName(contacts)).toEqual({
      uniqueContacts: contacts,
      collidingContacts: [],
    });
  });

  it('should hold back the later of two people sharing a merged contact', () => {
    const first = buildContactToUpdate('p1', 'people/1');
    const second = buildContactToUpdate('p2', 'people/1');

    expect(splitContactsByResourceName([first, second])).toEqual({
      uniqueContacts: [first],
      collidingContacts: [second],
    });
  });

  it('should return nothing for no contact', () => {
    expect(splitContactsByResourceName([])).toEqual({
      uniqueContacts: [],
      collidingContacts: [],
    });
  });
});
