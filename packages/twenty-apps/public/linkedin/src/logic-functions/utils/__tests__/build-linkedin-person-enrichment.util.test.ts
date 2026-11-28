import { describe, expect, it } from 'vitest';

import { buildLinkedinPersonEnrichment } from 'src/logic-functions/utils/build-linkedin-person-enrichment.util';

const PRIYA = { id: 'priya-provider-id', display_name: 'Priya Shah' };

describe('buildLinkedinPersonEnrichment', () => {
  it('takes the current job, the first email and the first phone', () => {
    expect(
      buildLinkedinPersonEnrichment({
        ...PRIYA,
        emails: ['Priya@Acme.com', 'priya@perso.com'],
        phone_numbers: [' +33 6 12 34 56 78 '],
        specifics: {
          experience: [
            { job_title: 'Head of Sales', ended_on: '01/01/2024' },
            { job_title: ' VP Sales ' },
          ],
        },
      }),
    ).toEqual({
      jobTitle: 'VP Sales',
      email: 'priya@acme.com',
      phoneNumber: '+33 6 12 34 56 78',
    });
  });

  it('leaves out what the profile does not share', () => {
    expect(
      buildLinkedinPersonEnrichment({
        ...PRIYA,
        emails: [],
        specifics: {
          experience: [{ job_title: 'Head of Sales', ended_on: '01/01/2024' }],
        },
      }),
    ).toEqual({});
  });
});
