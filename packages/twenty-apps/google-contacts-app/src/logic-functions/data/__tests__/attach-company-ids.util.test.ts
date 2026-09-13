import { describe, expect, it } from 'vitest';

import { attachCompanyIds } from 'src/logic-functions/data/attach-company-ids.util';
import { type ResolvedPerson } from 'src/logic-functions/data/resolve-people-to-upsert.util';

const buildResolvedPerson = (
  organization: ResolvedPerson['organization'],
): ResolvedPerson => ({
  personInput: { googleContactsId: 'c1' },
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
    ).toEqual([{ googleContactsId: 'c1', companyId: 'company-1' }]);
  });

  it('should attach the company matched on name', () => {
    expect(
      attachCompanyIds({
        resolvedPeople: [buildResolvedPerson({ name: '  ACME  ' })],
        companyIdsByKey: new Map([['name:acme', 'company-1']]),
      }),
    ).toEqual([{ googleContactsId: 'c1', companyId: 'company-1' }]);
  });

  it('should leave the existing link alone when the contact has no employer', () => {
    expect(
      attachCompanyIds({
        resolvedPeople: [buildResolvedPerson(undefined)],
        companyIdsByKey: new Map([['name:acme', 'company-1']]),
      }),
    ).toEqual([{ googleContactsId: 'c1' }]);
  });

  it('should leave the link alone when the employer resolved to nothing', () => {
    expect(
      attachCompanyIds({
        resolvedPeople: [buildResolvedPerson({ name: 'Globex' })],
        companyIdsByKey: new Map([['name:acme', 'company-1']]),
      }),
    ).toEqual([{ googleContactsId: 'c1' }]);
  });
});
