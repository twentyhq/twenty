import { describe, expect, it } from 'vitest';

import { readGoogleOrganization } from 'src/logic-functions/data/read-google-organization.util';
import { type Person } from 'src/logic-functions/types/google-response.type';

const buildPerson = (organizations: Person['organizations']): Person => ({
  resourceName: 'people/1',
  organizations,
});

describe('readGoogleOrganization', () => {
  it('should read the name and domain of the first organization', () => {
    expect(
      readGoogleOrganization(
        buildPerson([{ name: '  Acme  ', domain: 'https://WWW.acme.com' }]),
      ),
    ).toEqual({ name: 'Acme', domain: 'acme.com' });
  });

  it('should read an organization carrying only a name', () => {
    expect(readGoogleOrganization(buildPerson([{ name: 'Acme' }]))).toEqual({
      name: 'Acme',
    });
  });

  it('should read an organization carrying only a domain', () => {
    expect(
      readGoogleOrganization(buildPerson([{ domain: 'acme.com' }])),
    ).toEqual({ domain: 'acme.com' });
  });

  it('should ignore an organization carrying only a title', () => {
    expect(
      readGoogleOrganization(buildPerson([{ title: 'Engineer' }])),
    ).toBeUndefined();
  });

  it('should return nothing when the contact has no organization', () => {
    expect(readGoogleOrganization(buildPerson([]))).toBeUndefined();
  });
});
