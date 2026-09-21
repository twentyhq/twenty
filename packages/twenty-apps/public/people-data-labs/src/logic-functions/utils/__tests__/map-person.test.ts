import { describe, expect, it } from 'vitest';

import { PDL_PERSON_DATA_MOCK } from 'src/logic-functions/__mocks__/pdl-person-data.mock';
import { mapPerson } from 'src/logic-functions/utils/map-person';

describe('mapPerson', () => {
  it('maps standard fields', () => {
    const { standard } = mapPerson(PDL_PERSON_DATA_MOCK);

    expect(standard.name).toEqual({ firstName: 'Jane', lastName: 'Doe' });
    expect(standard.emails).toEqual({
      primaryEmail: 'jane.doe@acme.com',
      additionalEmails: ['jane@personal.com'],
    });
    expect(standard.jobTitle).toBe('Chief Executive Officer');
    expect(standard.linkedinLink).toMatchObject({
      primaryLinkUrl: 'https://linkedin.com/in/janedoe',
    });
  });

  it('maps pdl scalar, select and number fields', () => {
    const { pdl } = mapPerson(PDL_PERSON_DATA_MOCK);

    expect(pdl.pdlId).toBe('pdl-person-1');
    expect(pdl.pdlJobRole).toBe('ENGINEERING');
    expect(pdl.pdlIndustry).toBe('ACCOUNTING');
    expect(pdl.pdlInferredSalary).toBe('FROM_45000_TO_55000');
  });

  it('does not map company attributes onto the person', () => {
    const { pdl } = mapPerson(PDL_PERSON_DATA_MOCK);

    expect('pdlJobCompanyName' in pdl).toBe(false);
    expect('pdlJobCompanySize' in pdl).toBe(false);
  });

  it('drops unknown multi-select values', () => {
    const { pdl } = mapPerson(PDL_PERSON_DATA_MOCK);

    expect(pdl.pdlSeniority).toEqual(['CXO']);
  });

  it('dedupes array fields and passes raw json through', () => {
    const { pdl } = mapPerson(PDL_PERSON_DATA_MOCK);

    expect(pdl.pdlSkills).toEqual(['leadership', 'strategy']);
    expect(pdl.pdlExperience).toEqual([{ company: { name: 'Acme' } }]);
  });

  it('expands partial dates and builds the address with addressPostcode', () => {
    const { pdl } = mapPerson(PDL_PERSON_DATA_MOCK);

    expect(pdl.pdlBirthDate).toBe('1990-01-01');
    expect(pdl.pdlLocation).toMatchObject({
      addressCity: 'San Francisco',
      addressState: 'California',
      addressPostcode: '94107',
      addressCountry: 'United States',
    });
  });

  it('omits fields PDL did not return', () => {
    const { pdl } = mapPerson(PDL_PERSON_DATA_MOCK);

    expect('pdlSex' in pdl).toBe(false);
  });

  it('tolerates PDL returning presence-flag booleans for email and phone fields', () => {
    const { standard } = mapPerson({
      ...PDL_PERSON_DATA_MOCK,
      emails: true as never,
      personal_emails: true as never,
      phone_numbers: true as never,
    });

    expect(standard.emails).toEqual({
      primaryEmail: 'jane.doe@acme.com',
      additionalEmails: null,
    });
  });
});
