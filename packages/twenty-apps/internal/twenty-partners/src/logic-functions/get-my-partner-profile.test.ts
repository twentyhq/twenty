import { describe, expect, it } from 'vitest';

import { mapMyProfilePayload, type PartnerNode } from './get-my-partner-profile.logic-function';

const makeNode = (overrides: Partial<PartnerNode> = {}): PartnerNode =>
  ({
    id: 'partner-1',
    name: 'Nine Dots Ventures',
    introduction: 'Senior implementation partner.',
    city: 'Paris',
    country: 'FRANCE',
    languagesSpoken: ['ENGLISH', 'FRENCH'],
    partnerScope: ['ADVISORY'],
    skills: ['Salesforce'],
    typeOfTeam: 'AGENCY',
    availability: 'AVAILABLE',
    hourlyRate: { amountMicros: 150000000, currencyCode: 'USD' },
    projectBudgetMin: { amountMicros: 1000000000, currencyCode: 'USD' },
    website: { primaryLinkUrl: 'https://ninedots.example.com' },
    linkedin: { primaryLinkUrl: 'https://linkedin.com/company/nine-dots' },
    calendarLink: { primaryLinkUrl: 'https://cal.example.com/nine-dots' },
    profilePicture: { primaryLinkUrl: 'https://images.example.com/legacy.png' },
    profilePictureFile: [{ url: 'https://images.example.com/uploaded.png' }],
    region: ['EUROPE'],
    deploymentExpertise: ['CLOUD'],
    partnerLinks: {
      edges: [
        {
          node: {
            id: 'link-1',
            name: 'Case studies',
            url: { primaryLinkUrl: 'https://example.com/case-studies' },
            sortOrder: 1,
          },
        },
      ],
    },
    partnerServices: {
      edges: [
        {
          node: {
            id: 'service-1',
            title: 'Data migration',
            description: 'Historical sync and schema mapping.',
            sortOrder: 1,
          },
        },
      ],
    },
    partnerContents: {
      edges: [
        {
          node: {
            id: 'content-1',
            name: 'Acme case study',
            clientName: 'Acme Corp',
            headline: 'CRM migration',
            body: { markdown: 'Moved 12 teams to Twenty.' },
            coverImageUrl: 'https://images.example.com/case-study.png',
            caseStudyLink: { primaryLinkUrl: 'https://example.com/case-study' },
            status: 'APPROVED',
            contentType: ['CASE_STUDY'],
          },
        },
      ],
    },
    ...overrides,
  }) as PartnerNode;

describe('mapMyProfilePayload', () => {
  it('unwraps LINKS fields to their primaryLinkUrl', () => {
    const mapped = mapMyProfilePayload(makeNode());

    expect(mapped.website).toBe('https://ninedots.example.com');
    expect(mapped.linkedin).toBe('https://linkedin.com/company/nine-dots');
    expect(mapped.calendarLink).toBe('https://cal.example.com/nine-dots');
    expect(mapped.links[0].url).toBe('https://example.com/case-studies');
    expect(mapped.caseStudies[0].caseStudyLink).toBe('https://example.com/case-study');
  });

  it('prefers the uploaded profile picture file url over the legacy link', () => {
    const mapped = mapMyProfilePayload(makeNode());

    expect(mapped.profilePictureUrl).toBe('https://images.example.com/uploaded.png');
  });

  it('falls back to the legacy profile picture link when there is no uploaded file', () => {
    const mapped = mapMyProfilePayload(
      makeNode({ profilePictureFile: null }),
    );

    expect(mapped.profilePictureUrl).toBe('https://images.example.com/legacy.png');
  });

  it('maps case study body.markdown to bodyMarkdown and passes coverImageUrl through', () => {
    const mapped = mapMyProfilePayload(makeNode());

    expect(mapped.caseStudies[0].bodyMarkdown).toBe('Moved 12 teams to Twenty.');
    expect(mapped.caseStudies[0].coverImageUrl).toBe(
      'https://images.example.com/case-study.png',
    );
  });

  it('filters partnerContents to only CASE_STUDY rows, excluding quotes/logos', () => {
    const mapped = mapMyProfilePayload(
      makeNode({
        partnerContents: {
          edges: [
            {
              node: {
                id: 'content-1',
                name: 'Acme case study',
                clientName: 'Acme Corp',
                headline: 'CRM migration',
                body: { markdown: 'Moved 12 teams to Twenty.' },
                coverImageUrl: 'https://images.example.com/case-study.png',
                caseStudyLink: { primaryLinkUrl: 'https://example.com/case-study' },
                status: 'APPROVED',
                contentType: ['CASE_STUDY'],
              },
            },
            {
              node: {
                id: 'content-2',
                name: 'Nine Dots quote',
                clientName: 'Sunrise APAC',
                status: 'WIP',
                contentType: ['PARTNER_QUOTE'],
              },
            },
          ],
        },
      }),
    );

    expect(mapped.caseStudies).toHaveLength(1);
    expect(mapped.caseStudies[0].id).toBe('content-1');
  });

  it('maps links, services, and caseStudies edges to plain arrays', () => {
    const mapped = mapMyProfilePayload(makeNode());

    expect(mapped.links).toEqual([
      { id: 'link-1', name: 'Case studies', url: 'https://example.com/case-studies', sortOrder: 1 },
    ]);
    expect(mapped.services).toEqual([
      { id: 'service-1', title: 'Data migration', description: 'Historical sync and schema mapping.', sortOrder: 1 },
    ]);
    expect(mapped.caseStudies).toEqual([
      {
        id: 'content-1',
        name: 'Acme case study',
        clientName: 'Acme Corp',
        headline: 'CRM migration',
        bodyMarkdown: 'Moved 12 teams to Twenty.',
        coverImageUrl: 'https://images.example.com/case-study.png',
        caseStudyLink: 'https://example.com/case-study',
        status: 'APPROVED',
      },
    ]);
  });

  it('passes the pasted coverImageUrl through for the edit form', () => {
    const mapped = mapMyProfilePayload(
      makeNode({
        partnerContents: {
          edges: [
            {
              node: {
                id: 'content-1',
                name: 'Acme case study',
                clientName: 'Acme Corp',
                headline: 'CRM migration',
                body: { markdown: 'Moved 12 teams to Twenty.' },
                coverImageUrl: 'https://paste.example.com/cover.png',
                caseStudyLink: { primaryLinkUrl: 'https://example.com/case-study' },
                status: 'APPROVED',
                contentType: ['CASE_STUDY'],
              },
            },
          ],
        },
      } as Partial<PartnerNode>),
    );

    expect(mapped.caseStudies[0].coverImageUrl).toBe('https://paste.example.com/cover.png');
  });

  // The edit form binds the text coverImageUrl only; a file cover's signed URL must not
  // round-trip through save, so it is not surfaced here (the marketplace mapping still shows it).
  it('returns null coverImageUrl when the pasted url is empty', () => {
    const mapped = mapMyProfilePayload(
      makeNode({
        partnerContents: {
          edges: [
            {
              node: {
                id: 'content-1',
                name: 'Acme case study',
                clientName: 'Acme Corp',
                headline: 'CRM migration',
                body: { markdown: 'Moved 12 teams to Twenty.' },
                coverImageUrl: null,
                caseStudyLink: { primaryLinkUrl: 'https://example.com/case-study' },
                status: 'APPROVED',
                contentType: ['CASE_STUDY'],
              },
            },
          ],
        },
      } as Partial<PartnerNode>),
    );

    expect(mapped.caseStudies[0].coverImageUrl).toBeNull();
  });

  it('handles nulls and empty edges', () => {
    const mapped = mapMyProfilePayload(
      makeNode({
        name: null,
        introduction: null,
        city: null,
        country: null,
        languagesSpoken: null,
        partnerScope: null,
        skills: null,
        typeOfTeam: null,
        availability: null,
        hourlyRate: null,
        projectBudgetMin: null,
        website: null,
        linkedin: null,
        calendarLink: null,
        profilePicture: null,
        profilePictureFile: null,
        region: null,
        deploymentExpertise: null,
        partnerLinks: { edges: [] },
        partnerServices: { edges: [] },
        partnerContents: { edges: [] },
      }),
    );

    expect(mapped).toEqual({
      id: 'partner-1',
      name: null,
      introduction: null,
      city: null,
      country: null,
      languagesSpoken: null,
      partnerScope: null,
      skills: null,
      typeOfTeam: null,
      availability: null,
      hourlyRate: null,
      projectBudgetMin: null,
      website: null,
      linkedin: null,
      calendarLink: null,
      profilePicture: null,
      profilePictureUrl: null,
      region: null,
      deploymentExpertise: null,
      links: [],
      services: [],
      caseStudies: [],
    });
  });
});
