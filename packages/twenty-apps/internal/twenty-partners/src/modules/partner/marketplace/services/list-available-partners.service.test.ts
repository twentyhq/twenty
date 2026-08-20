import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryAvailablePartnersMock } = vi.hoisted(() => ({
  queryAvailablePartnersMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock(
  'src/modules/partner/marketplace/graphql/queries/list-available-partners',
  () => ({ queryAvailablePartners: queryAvailablePartnersMock }),
);

import { listAvailablePartners } from './list-available-partners.service';

describe('listAvailablePartners', () => {
  beforeEach(() => {
    queryAvailablePartnersMock.mockReset();
  });

  it('returns ranking metadata for each partner', async () => {
    queryAvailablePartnersMock.mockResolvedValue({
      partners: {
        edges: [
          {
            node: {
              id: 'partner-1',
              name: 'Acme',
              slug: 'acme',
              introduction: 'A complete implementation partner profile.',
              languagesSpoken: ['ENGLISH'],
              deploymentExpertise: ['CLOUD'],
              partnerTier: 'ADVANCED',
              partnerScope: ['SOLUTIONING'],
              region: ['EUROPE'],
              calendarLink: { primaryLinkUrl: 'https://cal.example.com/acme' },
              hourlyRate: { amountMicros: 100_000_000, currencyCode: 'USD' },
              projectBudgetMin: null,
              linkedin: { primaryLinkUrl: null },
              website: { primaryLinkUrl: 'https://acme.example.com' },
              profilePicture: { primaryLinkUrl: null },
              profilePictureFile: [],
              skills: ['Migration'],
              city: 'Paris',
              country: 'France',
              partnerServices: {
                edges: [
                  { node: { id: 'service-1' } },
                  { node: { id: 'service-2' } },
                ],
              },
              partnerContents: {
                edges: [
                  {
                    node: {
                      contentType: ['CASE_STUDY'],
                      status: 'APPROVED',
                      coverImageUrl: 'https://cdn.example.com/cover.png',
                      coverImage: [],
                    },
                  },
                  {
                    node: {
                      contentType: ['CASE_STUDY'],
                      status: 'APPROVED',
                      coverImageUrl: '',
                      coverImage: [{ url: 'https://cdn.example.com/file.png' }],
                    },
                  },
                  {
                    node: {
                      contentType: ['CASE_STUDY'],
                      status: 'APPROVED',
                      coverImageUrl: '   ',
                      coverImage: [],
                    },
                  },
                  {
                    node: {
                      contentType: ['CASE_STUDY'],
                      status: 'IN_REVIEW',
                      coverImageUrl: 'https://cdn.example.com/draft.png',
                      coverImage: [],
                    },
                  },
                  {
                    node: {
                      contentType: ['BLOG'],
                      status: 'APPROVED',
                      coverImageUrl: 'https://cdn.example.com/blog.png',
                      coverImage: [],
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    } as never);

    const result = await listAvailablePartners();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.partners[0]).toMatchObject({
      partnerTier: 'ADVANCED',
      serviceCount: 2,
      approvedCaseStudyCount: 3,
      approvedCaseStudyWithCoverCount: 2,
    });
    expect(result.partners[0].rotationKey).toMatch(/^[a-f0-9]{64}$/);
    expect(result.partners[0].rotationKey).not.toContain('partner-1');
  });

  it('counts zero for a partner with no services and no contents', async () => {
    queryAvailablePartnersMock.mockResolvedValue({
      partners: {
        edges: [
          {
            node: {
              id: 'partner-2',
              name: 'Fresh',
              slug: 'fresh',
              introduction: '',
              languagesSpoken: [],
              deploymentExpertise: [],
              partnerTier: null,
              partnerScope: [],
              region: [],
              calendarLink: { primaryLinkUrl: null },
              hourlyRate: null,
              projectBudgetMin: null,
              linkedin: { primaryLinkUrl: null },
              website: { primaryLinkUrl: null },
              profilePicture: { primaryLinkUrl: null },
              profilePictureFile: [],
              skills: [],
              city: null,
              country: null,
              partnerServices: null,
              partnerContents: null,
            },
          },
        ],
      },
    } as never);

    const result = await listAvailablePartners();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.partners[0]).toMatchObject({
      partnerTier: null,
      serviceCount: 0,
      approvedCaseStudyCount: 0,
      approvedCaseStudyWithCoverCount: 0,
    });
    expect(result.partners[0].rotationKey).toMatch(/^[a-f0-9]{64}$/);
  });
});
