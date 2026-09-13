import { describe, expect, it } from 'vitest';

import { mapGooglePerson } from 'src/logic-functions/data/map-google-person.util';
import { type Person } from 'src/logic-functions/types/google-response.type';

// Every case needs an identifiable contact, otherwise the mapper skips it.
const buildPerson = (overrides: Partial<Person> = {}): Person => ({
  resourceName: 'people/c123',
  names: [{ givenName: 'John', familyName: 'Doe' }],
  ...overrides,
});

describe('mapGooglePerson', () => {
  it('should strip the resource name prefix into googleContactsId', () => {
    expect(mapGooglePerson(buildPerson())?.googleContactsId).toBe('c123');
  });

  it('should map the structured name rather than parsing a display name', () => {
    const person = buildPerson({
      names: [
        {
          givenName: 'John',
          familyName: 'Doe',
          displayNameLastFirst: 'Doe, John',
        },
      ],
    });

    expect(mapGooglePerson(person)?.name).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should keep a mononym as the first name', () => {
    const person = buildPerson({ names: [{ displayName: 'Cher' }] });

    expect(mapGooglePerson(person)?.name).toEqual({
      firstName: 'Cher',
      lastName: '',
    });
  });

  it('should map an email-only contact without a name', () => {
    const person = buildPerson({
      names: undefined,
      emailAddresses: [{ value: 'john@example.com' }],
    });
    const mappedPerson = mapGooglePerson(person);

    expect(mappedPerson?.name).toEqual({ firstName: '', lastName: '' });
    expect(mappedPerson?.emails?.primaryEmail).toBe('john@example.com');
  });

  it('should skip a contact Google cannot identify', () => {
    expect(mapGooglePerson({ resourceName: 'people/c123' })).toBeUndefined();
  });

  it('should not repeat the primary email in additional emails', () => {
    const person = buildPerson({
      emailAddresses: [
        { value: 'john@example.com' },
        { value: 'j.doe@example.com' },
      ],
    });

    expect(mapGooglePerson(person)?.emails).toEqual({
      primaryEmail: 'john@example.com',
      additionalEmails: ['j.doe@example.com'],
    });
  });

  it('should empty emails when the contact has none', () => {
    expect(mapGooglePerson(buildPerson())?.emails).toEqual({
      primaryEmail: null,
      additionalEmails: [],
    });
  });

  it('should keep every parseable phone number', () => {
    const person = buildPerson({
      phoneNumbers: [
        { canonicalForm: '+33612345678' },
        { canonicalForm: '+14155552671' },
      ],
    });

    expect(mapGooglePerson(person)?.phones).toEqual({
      primaryPhoneNumber: '612345678',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneCallingCode: '+33',
      additionalPhones: [
        { number: '4155552671', countryCode: 'US', callingCode: '+1' },
      ],
    });
  });

  it('should skip unparseable phone numbers instead of failing the contact', () => {
    const person = buildPerson({
      phoneNumbers: [
        { value: 'ask my assistant' },
        { canonicalForm: '+33612345678' },
      ],
    });

    expect(mapGooglePerson(person)?.phones?.primaryPhoneNumber).toBe(
      '612345678',
    );
  });

  it('should empty phones when none can be parsed', () => {
    const person = buildPerson({ phoneNumbers: [{ value: 'n/a' }] });

    expect(mapGooglePerson(person)?.phones).toEqual({
      primaryPhoneNumber: '',
      primaryPhoneCallingCode: '',
      primaryPhoneCountryCode: '',
      additionalPhones: [],
    });
  });

  it('should map matching social links to their url', () => {
    const person = buildPerson({
      urls: [
        { value: 'https://www.linkedin.com/in/johndoe' },
        { value: 'https://x.com/johndoe' },
      ],
    });
    const mappedPerson = mapGooglePerson(person);

    expect(mappedPerson?.linkedinLink).toEqual({
      primaryLinkUrl: 'https://www.linkedin.com/in/johndoe',
      primaryLinkLabel: '',
      secondaryLinks: null,
    });
    expect(mappedPerson?.xLink?.primaryLinkUrl).toBe('https://x.com/johndoe');
  });

  it('should empty the links when no url matches', () => {
    const person = buildPerson({
      urls: [{ value: 'https://github.com/johndoe' }],
    });
    const mappedPerson = mapGooglePerson(person);
    const emptyLink = {
      primaryLinkUrl: '',
      primaryLinkLabel: '',
      secondaryLinks: null,
    };

    expect(mappedPerson?.xLink).toEqual(emptyLink);
    expect(mappedPerson?.linkedinLink).toEqual(emptyLink);
  });

  it('should not treat a lookalike domain as a match', () => {
    const person = buildPerson({
      urls: [{ value: 'https://box.com/johndoe' }],
    });

    expect(mapGooglePerson(person)?.xLink?.primaryLinkUrl).toBe('');
  });

  it('should map a legacy twitter.com url to xLink', () => {
    const person = buildPerson({
      urls: [{ value: 'https://twitter.com/johndoe' }],
    });

    expect(mapGooglePerson(person)?.xLink?.primaryLinkUrl).toBe(
      'https://twitter.com/johndoe',
    );
  });

  it('should map the job title of the first organization', () => {
    const person = buildPerson({
      organizations: [{ name: 'Acme', title: 'CTO' }],
    });

    expect(mapGooglePerson(person)?.jobTitle).toBe('CTO');
  });

  it('should empty the job title for an organization without one', () => {
    const person = buildPerson({ organizations: [{ name: 'Acme' }] });

    expect(mapGooglePerson(person)?.jobTitle).toBe('');
  });

  it('should map an uploaded photo to the avatar url', () => {
    const person = buildPerson({
      photos: [
        { url: 'https://lh3.googleusercontent.com/a/abc', default: false },
      ],
    });

    expect(mapGooglePerson(person)?.avatarUrl).toBe(
      'https://lh3.googleusercontent.com/a/abc',
    );
  });

  it('should ignore the placeholder photo Google returns by default', () => {
    const person = buildPerson({
      photos: [
        {
          url: 'https://lh3.googleusercontent.com/placeholder',
          default: true,
        },
      ],
    });

    expect(mapGooglePerson(person)?.avatarUrl).toBe('');
  });

  it('should clear every field the contact no longer carries', () => {
    expect(mapGooglePerson(buildPerson())).toEqual({
      googleContactsId: 'c123',
      name: { firstName: 'John', lastName: 'Doe' },
      emails: { primaryEmail: null, additionalEmails: [] },
      phones: {
        primaryPhoneNumber: '',
        primaryPhoneCallingCode: '',
        primaryPhoneCountryCode: '',
        additionalPhones: [],
      },
      jobTitle: '',
      linkedinLink: {
        primaryLinkUrl: '',
        primaryLinkLabel: '',
        secondaryLinks: null,
      },
      xLink: {
        primaryLinkUrl: '',
        primaryLinkLabel: '',
        secondaryLinks: null,
      },
      avatarUrl: '',
    });
  });
});
