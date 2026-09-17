import { describe, expect, it } from 'vitest';

import { attachCompanyIds } from 'src/logic-functions/data/attach-company-ids.util';
import { type ResolvedPerson } from 'src/logic-functions/data/resolve-people-to-upsert.util';
import { type TwentyPersonInput } from 'src/logic-functions/types/twenty-person.type';

// The sync writes every field it owns, so the input always carries them all.
const buildPersonInput = (): TwentyPersonInput => ({
  googleContactsId: 'c1',
  name: { firstName: '', lastName: '' },
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
  avatarUrl: '',
});

const buildResolvedPerson = (
  organization: ResolvedPerson['organization'],
): ResolvedPerson => ({
  personInput: buildPersonInput(),
  organization,
});

describe('attachCompanyIds', () => {
  it('should attach the company matched on domain', () => {
    expect(
      attachCompanyIds({
        resolvedPeople: [
          buildResolvedPerson({ name: 'Acme', domain: 'acme.com' }),
        ],
        companyIdsByKey: new Map([['domain:acme.com', 'company-1']]),
      }),
    ).toEqual([{ ...buildPersonInput(), companyId: 'company-1' }]);
  });

  it('should attach the company matched on name', () => {
    expect(
      attachCompanyIds({
        resolvedPeople: [buildResolvedPerson({ name: '  ACME  ' })],
        companyIdsByKey: new Map([['name:acme', 'company-1']]),
      }),
    ).toEqual([{ ...buildPersonInput(), companyId: 'company-1' }]);
  });

  it('should leave the existing link alone when the contact has no employer', () => {
    expect(
      attachCompanyIds({
        resolvedPeople: [buildResolvedPerson(undefined)],
        companyIdsByKey: new Map([['name:acme', 'company-1']]),
      }),
    ).toEqual([buildPersonInput()]);
  });

  it('should leave the link alone when the employer resolved to nothing', () => {
    expect(
      attachCompanyIds({
        resolvedPeople: [buildResolvedPerson({ name: 'Globex' })],
        companyIdsByKey: new Map([['name:acme', 'company-1']]),
      }),
    ).toEqual([buildPersonInput()]);
  });
});
