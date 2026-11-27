import { describe, expect, it } from 'vitest';

import { buildLinkedinPersonEnrichment } from 'src/logic-functions/utils/build-linkedin-person-enrichment.util';

const PRIYA = { id: 'priya-provider-id', display_name: 'Priya Shah' };

describe('buildLinkedinPersonEnrichment', () => {
  it('takes the current job, the city, the first email and the X profile', () => {
    expect(
      buildLinkedinPersonEnrichment({
        ...PRIYA,
        location: 'Paris, Île-de-France, France',
        emails: ['Priya@Acme.com', 'priya@perso.com'],
        social_handles: { x: { url: 'https://x.com/priya' } },
        specifics: {
          experience: [
            { job_title: 'Head of Sales', ended_on: '01/01/2024' },
            { job_title: ' VP Sales ' },
          ],
        },
      }),
    ).toEqual({
      jobTitle: 'VP Sales',
      city: 'Paris',
      email: 'priya@acme.com',
      xLinkUrl: 'https://x.com/priya',
    });
  });

  it('leaves out what the profile does not share', () => {
    expect(
      buildLinkedinPersonEnrichment({
        ...PRIYA,
        location: ' ',
        emails: [],
        specifics: {
          experience: [{ job_title: 'Head of Sales', ended_on: '01/01/2024' }],
        },
      }),
    ).toEqual({});
  });
});
