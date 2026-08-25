import { describe, expect, it } from 'vitest';

import {
  type EvidenceSource,
  type PartnerForPreReview,
} from 'src/modules/partner/pre-review/types/pre-review.type';

import { buildEvidencePack } from './build-evidence-pack.mapper';

const partner: PartnerForPreReview = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Analytical Engines Ltd',
  city: 'Paris',
  country: 'FRANCE',
  typeOfTeam: 'AGENCY',
  partnerScope: ['ADVISORY', 'DEVELOPMENT'],
  skills: ['Migration', 'n8n'],
  twentyExperience: ['CUSTOM_APPS', 'WORKFLOWS'],
  twentyExperienceNotes: 'Built a hiring app on Twenty for a 40-seat client.',
  applicationNotes: null,
  hourlyRateAmountMicros: 150_000_000,
  projectBudgetMinAmountMicros: 5_000_000_000,
  websiteUrl: 'https://acme.com',
  linkedinUrl: 'https://www.linkedin.com/in/ada',
  proofUrl: 'https://crm.acme.com',
};

const emptySource = (
  overrides: Partial<EvidenceSource> & Pick<EvidenceSource, 'label' | 'url' | 'classification'>,
): EvidenceSource => ({
  excerpt: null,
  videoTitle: null,
  videoDescription: null,
  videoThumbnailUrl: null,
  captionExcerpt: null,
  failureReason: null,
  ...overrides,
});

describe('buildEvidencePack', () => {
  it('renders the application facts and every source section', () => {
    const pack = buildEvidencePack({
      partner,
      sources: [
        emptySource({
          label: 'website',
          url: 'https://acme.com',
          classification: 'site',
          excerpt: 'Acme builds CRM implementations.',
        }),
        emptySource({
          label: 'linkedin',
          url: 'https://www.linkedin.com/in/ada',
          classification: 'linkedin',
        }),
        emptySource({
          label: 'proof',
          url: 'https://crm.acme.com',
          classification: 'twenty-instance',
          excerpt: 'Twenty',
        }),
      ],
    });

    expect(pack.text).toContain('## Application');
    expect(pack.text).toContain('Name: Analytical Engines Ltd');
    expect(pack.text).toContain('Hourly rate: 150 USD');
    expect(pack.text).toContain('Minimum project budget: 5000 USD');
    expect(pack.text).toContain('Twenty experience: CUSTOM_APPS, WORKFLOWS');
    expect(pack.text).toContain('## Source: proof');
    expect(pack.text).toContain('Classification: twenty-instance');
    expect(pack.text).toContain('Excerpt: Acme builds CRM implementations.');
  });

  it('counts a live Twenty instance as verifiable proof', () => {
    const pack = buildEvidencePack({
      partner,
      sources: [
        emptySource({
          label: 'proof',
          url: 'https://crm.acme.com',
          classification: 'twenty-instance',
          excerpt: 'Twenty',
        }),
      ],
    });

    expect(pack.hasVerifiableProof).toBe(true);
    expect(pack.needsHumanLook).toEqual([]);
  });

  it('counts a YouTube video as verifiable proof only when captions were read', () => {
    const withCaptions = buildEvidencePack({
      partner,
      sources: [
        emptySource({
          label: 'proof',
          url: 'https://youtu.be/abc',
          classification: 'video-youtube',
          videoTitle: 'Twenty rollout',
          captionExcerpt: 'We migrated the client onto Twenty.',
        }),
      ],
    });
    const withoutCaptions = buildEvidencePack({
      partner,
      sources: [
        emptySource({
          label: 'proof',
          url: 'https://youtu.be/abc',
          classification: 'video-youtube',
          videoTitle: 'Twenty rollout',
        }),
      ],
    });

    expect(withCaptions.hasVerifiableProof).toBe(true);
    expect(withoutCaptions.hasVerifiableProof).toBe(false);
  });

  it('never counts LinkedIn, file drops, or dead links as proof', () => {
    const pack = buildEvidencePack({
      partner,
      sources: [
        emptySource({
          label: 'linkedin',
          url: 'https://www.linkedin.com/in/ada',
          classification: 'linkedin',
        }),
        emptySource({
          label: 'proof',
          url: 'https://drive.google.com/drive/folders/abc',
          classification: 'drive-or-filedrop',
          excerpt: 'Shared folder',
        }),
        emptySource({
          label: 'website',
          url: 'https://acme.com',
          classification: 'dead',
          failureReason: 'HTTP 404',
        }),
      ],
    });

    expect(pack.hasVerifiableProof).toBe(false);
  });

  it('lists every item a human still has to open', () => {
    const pack = buildEvidencePack({
      partner,
      sources: [
        emptySource({
          label: 'linkedin',
          url: 'https://www.linkedin.com/in/ada',
          classification: 'linkedin',
        }),
        emptySource({
          label: 'proof',
          url: 'https://www.loom.com/share/abc',
          classification: 'video-loom',
          videoTitle: 'Acme demo',
        }),
        emptySource({
          label: 'website',
          url: 'https://slow.acme.com',
          classification: 'site',
          failureReason: 'Timed out after 12s',
        }),
      ],
    });

    expect(pack.needsHumanLook).toEqual([
      'LinkedIn profile — blocked to automated fetch: https://www.linkedin.com/in/ada',
      'Video not watched, only its title and description were read: https://www.loom.com/share/abc',
      'Could not be read (timeout or auth wall): https://slow.acme.com',
    ]);
  });

  it('states plainly when a link is dead', () => {
    const pack = buildEvidencePack({
      partner,
      sources: [
        emptySource({
          label: 'proof',
          url: 'https://acme.com/gone',
          classification: 'dead',
          failureReason: 'HTTP 404',
        }),
      ],
    });

    expect(pack.text).toContain('Fetch failed: HTTP 404');
    expect(pack.text).toContain('Classification: dead');
    expect(pack.needsHumanLook).toEqual([]);
  });

  it('records that no link at all was supplied', () => {
    const pack = buildEvidencePack({
      partner: {
        ...partner,
        websiteUrl: null,
        linkedinUrl: null,
        proofUrl: null,
      },
      sources: [],
    });

    expect(pack.text).toContain('No public link was supplied.');
    expect(pack.hasVerifiableProof).toBe(false);
  });
});
