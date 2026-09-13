import { describe, expect, it } from 'vitest';

import { mapTwentyPerson } from 'src/logic-functions/data/map-twenty-person.util';
import { type Person } from 'src/logic-functions/types/google-response.type';
import { type TwentyPersonRecord } from 'src/logic-functions/types/twenty-person.type';

const buildTwentyPerson = (
  overrides: Partial<TwentyPersonRecord> = {},
): TwentyPersonRecord => ({
  id: '8d8b6a5f-6b2a-4a8e-8e3f-1a2b3c4d5e6f',
  name: { firstName: 'John', lastName: 'Doe' },
  ...overrides,
});

const buildExistingContact = (overrides: Partial<Person> = {}): Person => ({
  resourceName: 'people/c123',
  etag: '%EgUBAj0DBw==',
  ...overrides,
});

describe('mapTwentyPerson', () => {
  it('should map the structured name', () => {
    expect(mapTwentyPerson(buildTwentyPerson()).names).toEqual([
      { givenName: 'John', familyName: 'Doe' },
    ]);
  });

  it('should omit a name nobody filled in', () => {
    const person = buildTwentyPerson({
      name: { firstName: '', lastName: null },
    });

    expect(mapTwentyPerson(person).names).toBeUndefined();
  });

  it('should map the primary email before the additional ones', () => {
    const person = buildTwentyPerson({
      emails: {
        primaryEmail: 'john@example.com',
        additionalEmails: ['john.doe@example.com'],
      },
    });

    expect(mapTwentyPerson(person).emailAddresses).toEqual([
      { value: 'john@example.com' },
      { value: 'john.doe@example.com' },
    ]);
  });

  it('should rebuild phone numbers in their international form', () => {
    const person = buildTwentyPerson({
      phones: {
        primaryPhoneNumber: '612345678',
        primaryPhoneCallingCode: '+33',
        additionalPhones: [{ number: '2079460958', callingCode: '+44' }],
      },
    });

    expect(mapTwentyPerson(person).phoneNumbers).toEqual([
      { value: '+33612345678' },
      { value: '+442079460958' },
    ]);
  });

  it('should keep a phone number without a calling code as is', () => {
    const person = buildTwentyPerson({
      phones: { primaryPhoneNumber: '612345678', primaryPhoneCallingCode: '' },
    });

    expect(mapTwentyPerson(person).phoneNumbers).toEqual([
      { value: '612345678' },
    ]);
  });

  it('should map the job title and the company name onto one organization', () => {
    const person = buildTwentyPerson({
      jobTitle: 'CTO',
      company: { name: 'Twenty' },
    });

    expect(mapTwentyPerson(person).organizations).toEqual([
      { name: 'Twenty', title: 'CTO' },
    ]);
  });

  it('should keep organization details Twenty does not model', () => {
    const person = buildTwentyPerson({ jobTitle: 'CTO' });
    const existingContact = buildExistingContact({
      organizations: [{ name: 'Twenty', title: 'CEO' }],
    });

    expect(mapTwentyPerson(person, existingContact).organizations).toEqual([
      { name: 'Twenty', title: 'CTO' },
    ]);
  });

  it('should map the linkedin and x links', () => {
    const person = buildTwentyPerson({
      linkedinLink: { primaryLinkUrl: 'https://linkedin.com/in/john' },
      xLink: { primaryLinkUrl: 'https://x.com/john' },
    });

    expect(mapTwentyPerson(person).urls).toEqual([
      { value: 'https://linkedin.com/in/john' },
      { value: 'https://x.com/john' },
    ]);
  });

  it('should replace the social links but keep the other urls', () => {
    const person = buildTwentyPerson({
      linkedinLink: { primaryLinkUrl: 'https://linkedin.com/in/john' },
    });
    const existingContact = buildExistingContact({
      urls: [
        { value: 'https://johndoe.com' },
        { value: 'https://www.linkedin.com/in/outdated' },
      ],
    });

    expect(mapTwentyPerson(person, existingContact).urls).toEqual([
      { value: 'https://johndoe.com' },
      { value: 'https://linkedin.com/in/john' },
    ]);
  });

  it('should leave untouched fields out so the update mask never clears them', () => {
    expect(mapTwentyPerson(buildTwentyPerson())).toEqual({
      names: [{ givenName: 'John', familyName: 'Doe' }],
    });
  });

  it('should map an empty person to an empty contact', () => {
    expect(
      mapTwentyPerson({ id: 'c9a0e1f2-3b4c-4d5e-8f90-123456789abc' }),
    ).toEqual({});
  });
});
