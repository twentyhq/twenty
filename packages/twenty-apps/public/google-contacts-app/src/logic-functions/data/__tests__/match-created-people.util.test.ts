import { describe, expect, it } from 'vitest';

import { matchCreatedPeople } from 'src/logic-functions/data/match-created-people.util';
import { type ContactToCreate } from 'src/logic-functions/types/contact-write.type';
import { type PersonResponse } from 'src/logic-functions/types/google-response.type';

const buildContactToCreate = (
  personId: string,
  givenName: string,
): ContactToCreate =>
  ({
    person: { id: personId },
    contact: {
      names: [{ givenName, familyName: 'Doe' }],
      emailAddresses: [{ value: `${givenName.toLowerCase()}@example.com` }],
    },
  }) as ContactToCreate;

const buildCreatedPerson = (
  givenName: string,
  resourceName: string,
): PersonResponse => ({
  person: {
    resourceName,
    names: [{ givenName, familyName: 'Doe' }],
    emailAddresses: [{ value: `${givenName.toLowerCase()}@example.com` }],
  },
});

describe('matchCreatedPeople', () => {
  it('should pair entries by index when Google answers in request order', () => {
    const contactsToCreate = [
      buildContactToCreate('person-1', 'John'),
      buildContactToCreate('person-2', 'Jane'),
    ];
    const createdPeople = [
      buildCreatedPerson('John', 'people/1'),
      buildCreatedPerson('Jane', 'people/2'),
    ];

    expect(matchCreatedPeople({ contactsToCreate, createdPeople })).toEqual([
      createdPeople[0],
      createdPeople[1],
    ]);
  });

  it('should pair entries by content when Google answers out of order', () => {
    const contactsToCreate = [
      buildContactToCreate('person-1', 'John'),
      buildContactToCreate('person-2', 'Jane'),
    ];
    const createdPeople = [
      buildCreatedPerson('Jane', 'people/2'),
      buildCreatedPerson('John', 'people/1'),
    ];

    expect(matchCreatedPeople({ contactsToCreate, createdPeople })).toEqual([
      createdPeople[1],
      createdPeople[0],
    ]);
  });

  it('should keep a failed entry on its own index', () => {
    const contactsToCreate = [
      buildContactToCreate('person-1', 'John'),
      buildContactToCreate('person-2', 'Jane'),
    ];
    const failedEntry: PersonResponse = { status: { code: 3, message: 'Bad' } };
    const createdPeople = [failedEntry, buildCreatedPerson('Jane', 'people/2')];

    expect(matchCreatedPeople({ contactsToCreate, createdPeople })).toEqual([
      failedEntry,
      createdPeople[1],
    ]);
  });

  it('should leave a contact unmatched when Google returns nothing for it', () => {
    const contactsToCreate = [
      buildContactToCreate('person-1', 'John'),
      buildContactToCreate('person-2', 'Jane'),
    ];
    const createdPeople = [buildCreatedPerson('Jane', 'people/2')];

    expect(matchCreatedPeople({ contactsToCreate, createdPeople })).toEqual([
      undefined,
      createdPeople[0],
    ]);
  });

  it('should hand identical contacts one distinct entry each', () => {
    const contactsToCreate = [
      buildContactToCreate('person-1', 'John'),
      buildContactToCreate('person-2', 'John'),
    ];
    const createdPeople = [
      buildCreatedPerson('John', 'people/1'),
      buildCreatedPerson('John', 'people/2'),
    ];

    const matched = matchCreatedPeople({ contactsToCreate, createdPeople });

    expect(matched[0]?.person?.resourceName).toBe('people/1');
    expect(matched[1]?.person?.resourceName).toBe('people/2');
  });
});
