import { describe, expect, it } from 'vitest';

import { mapPartnerForMarketplace } from './map-partner-for-marketplace';

const makeNode = () => ({
  name: 'Nine Dots Ventures',
  slug: 'nine-dots-ventures',
  introduction: '## About\n\n**Senior** implementation partner.',
  languagesSpoken: ['ENGLISH'],
  deploymentExpertise: ['CRM_IMPLEMENTATION'],
  partnerScope: ['IMPLEMENTATION'],
  region: ['EUROPE'],
  calendarLink: { primaryLinkUrl: 'https://cal.example.com' },
  hourlyRate: { amountMicros: 150_000_000, currencyCode: 'USD' },
  projectBudgetMin: { amountMicros: 1_000_000_000, currencyCode: 'USD' },
  linkedin: { primaryLinkUrl: 'https://linkedin.com/company/nine-dots' },
  website: { primaryLinkUrl: 'https://ninedots.example.com' },
  profilePicture: { primaryLinkUrl: 'https://images.example.com/legacy.png' },
  profilePictureFile: [{ url: 'https://images.example.com/uploaded.png' }],
  skills: ['Salesforce', 'HubSpot'],
  city: 'Paris',
  country: 'France',
  partnerLinks: {
    edges: [] as Array<{
      node: {
        url: { primaryLinkUrl: string | null } | null;
        sortOrder: number | null;
        position: number | null;
      };
    }>,
  },
  partnerServices: {
    edges: [] as Array<{
      node: {
        title: string | null;
        description: string | null;
        sortOrder: number | null;
        position: number | null;
      };
    }>,
  },
  partnerContents: {
    edges: [] as Array<{
      node: {
        contentType: string | readonly string[] | null;
        status: string | null;
        clientName: string | null;
        headline: string | null;
        body: { markdown: string | null } | null;
        coverImage?: ReadonlyArray<{ url?: string | null } | null> | null;
        coverImageUrl?: string | null;
        caseStudyLink: { primaryLinkUrl: string | null } | null;
        position: number | null;
      };
    }>,
  },
});

describe('mapPartnerForMarketplace', () => {
  it('maps list detail introduction from markdown as a plain excerpt', () => {
    const node = makeNode();
    node.introduction = `### Delivery partner\n\n${'A'.repeat(260)}\n\n- Platform migration`;

    const mapped = mapPartnerForMarketplace(node, 'list');

    expect(mapped.introduction.length).toBe(220);
    expect(mapped.introduction).toContain('Delivery partner');
    expect(mapped.introduction).not.toContain('###');
    expect(mapped.introduction).not.toContain('- ');
    expect('projectBudgetTypical' in mapped).toBe(false);
    expect('profileLinks' in mapped).toBe(false);
    expect('services' in mapped).toBe(false);
    expect('portfolio' in mapped).toBe(false);
  });

  it('keeps the full markdown introduction in profile detail', () => {
    const node = makeNode();
    node.introduction =
      '## About us\n\n**Bold statement** with [link](https://example.com).';

    const mapped = mapPartnerForMarketplace(node, 'profile');

    expect(mapped.introduction).toBe(
      '## About us\n\n**Bold statement** with [link](https://example.com).',
    );
  });

  it('aliases projectBudgetTypical from projectBudgetMin in profile detail', () => {
    const node = makeNode();

    const mapped = mapPartnerForMarketplace(node, 'profile');

    expect(mapped.projectBudgetTypical).toEqual(node.projectBudgetMin);
  });

  it('merges and deduplicates profile links from PartnerLink, website, and linkedin', () => {
    const node = makeNode();
    node.partnerLinks.edges = [
      {
        node: {
          url: { primaryLinkUrl: 'https://example.com/community' },
          sortOrder: 2,
          position: 2,
        },
      },
      {
        node: {
          url: { primaryLinkUrl: 'https://ninedots.example.com' },
          sortOrder: 1,
          position: 1,
        },
      },
    ];

    const mapped = mapPartnerForMarketplace(node, 'profile');

    expect(mapped.profileLinks).toEqual([
      { primaryLinkUrl: 'https://ninedots.example.com' },
      { primaryLinkUrl: 'https://example.com/community' },
      { primaryLinkUrl: 'https://linkedin.com/company/nine-dots' },
    ]);
  });

  it('maps only approved case studies into portfolio entries', () => {
    const node = makeNode();
    node.partnerContents.edges = [
      {
        node: {
          contentType: ['CASE_STUDY'],
          status: 'APPROVED',
          clientName: 'Acme Corp',
          headline: 'CRM migration',
          body: { markdown: 'Moved 12 teams to Twenty.' },
          coverImage: [{ url: 'https://images.example.com/case-study.png' }],
          caseStudyLink: { primaryLinkUrl: 'https://example.com/case-study' },
          position: 1,
        },
      },
      {
        node: {
          contentType: ['CASE_STUDY'],
          status: 'IN_REVIEW',
          clientName: 'Hidden Client',
          headline: 'Draft project',
          body: { markdown: 'Should not be returned.' },
          coverImage: [{ url: 'https://images.example.com/draft.png' }],
          caseStudyLink: { primaryLinkUrl: 'https://example.com/draft' },
          position: 2,
        },
      },
      {
        node: {
          contentType: ['BLOG'],
          status: 'APPROVED',
          clientName: 'Content marketing',
          headline: 'Blog post',
          body: { markdown: 'Not a case study.' },
          coverImage: [{ url: 'https://images.example.com/blog.png' }],
          caseStudyLink: { primaryLinkUrl: 'https://example.com/blog' },
          position: 3,
        },
      },
    ];

    const mapped = mapPartnerForMarketplace(node, 'profile');

    expect(mapped.portfolio).toEqual([
      {
        client: 'Acme Corp',
        title: 'CRM migration',
        body: 'Moved 12 teams to Twenty.',
        imageUrl: 'https://images.example.com/case-study.png',
        link: 'https://example.com/case-study',
      },
    ]);
  });

  it('prefers the pasted coverImageUrl over the uploaded coverImage file in portfolio', () => {
    const node = makeNode();
    node.partnerContents.edges = [
      {
        node: {
          contentType: ['CASE_STUDY'],
          status: 'APPROVED',
          clientName: 'Acme Corp',
          headline: 'CRM migration',
          body: { markdown: 'Moved 12 teams to Twenty.' },
          coverImageUrl: 'https://paste.example.com/cover.png',
          coverImage: [{ url: 'https://file.example.com/cover.png' }],
          caseStudyLink: { primaryLinkUrl: 'https://example.com/case-study' },
          position: 1,
        },
      },
    ];

    expect(mapPartnerForMarketplace(node, 'profile').portfolio[0].imageUrl).toBe(
      'https://paste.example.com/cover.png',
    );
  });

  it('falls back to the coverImage file url when coverImageUrl is absent', () => {
    const node = makeNode();
    node.partnerContents.edges = [
      {
        node: {
          contentType: ['CASE_STUDY'],
          status: 'APPROVED',
          clientName: 'Acme Corp',
          headline: 'CRM migration',
          body: { markdown: 'Moved 12 teams to Twenty.' },
          coverImageUrl: null,
          coverImage: [{ url: 'https://file.example.com/cover.png' }],
          caseStudyLink: { primaryLinkUrl: 'https://example.com/case-study' },
          position: 1,
        },
      },
    ];

    expect(mapPartnerForMarketplace(node, 'profile').portfolio[0].imageUrl).toBe(
      'https://file.example.com/cover.png',
    );
  });

  it('sorts services by sortOrder ascending with nulls last', () => {
    const node = makeNode();
    node.partnerServices.edges = [
      {
        node: {
          title: 'RevOps coaching',
          description: 'Cross-team alignment and reporting.',
          position: 3,
        },
      },
      {
        node: {
          title: 'Data migration',
          description: 'Historical sync and schema mapping.',
          position: 1,
        },
      },
      {
        node: {
          title: 'Fractional CRM lead',
          description: 'Weekly operating cadence support.',
          position: null,
        },
      },
    ];

    const mapped = mapPartnerForMarketplace(node, 'profile');

    expect(mapped.services).toEqual([
      {
        title: 'Data migration',
        description: 'Historical sync and schema mapping.',
      },
      {
        title: 'RevOps coaching',
        description: 'Cross-team alignment and reporting.',
      },
      {
        title: 'Fractional CRM lead',
        description: 'Weekly operating cadence support.',
      },
    ]);
  });
});
