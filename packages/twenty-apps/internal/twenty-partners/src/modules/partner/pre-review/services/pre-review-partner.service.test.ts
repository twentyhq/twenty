import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock, runAgentMock, collectSourcesMock } = vi.hoisted(
  () => ({
    queryMock: vi.fn(),
    mutationMock: vi.fn(),
    runAgentMock: vi.fn(),
    collectSourcesMock: vi.fn(),
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

vi.mock('twenty-sdk/logic-function', () => ({ runAgent: runAgentMock }));

vi.mock(
  'src/modules/partner/pre-review/services/collect-pre-review-sources.service',
  () => ({ collectPreReviewSources: collectSourcesMock }),
);

import { CoreApiClient } from 'twenty-client-sdk/core';

import { preReviewPartner } from './pre-review-partner.service';

const PARTNER_ID = '11111111-1111-1111-1111-111111111111';

const partnerNode = (overrides: Record<string, unknown> = {}) => ({
  partner: {
    id: PARTNER_ID,
    name: 'Analytical Engines Ltd',
    city: 'Paris',
    country: 'FRANCE',
    typeOfTeam: 'AGENCY',
    partnerScope: ['ADVISORY'],
    skills: ['Migration'],
    twentyExperience: ['CUSTOM_APPS'],
    twentyExperienceNotes: 'Built a hiring app on Twenty.',
    applicationNotes: null,
    preReviewVerdict: null,
    hourlyRate: { amountMicros: 150_000_000 },
    projectBudgetMin: { amountMicros: 5_000_000_000 },
    website: { primaryLinkUrl: 'https://acme.com' },
    linkedin: null,
    twentyExperienceProofLink: { primaryLinkUrl: 'https://crm.acme.com' },
    ...overrides,
  },
});

const verifiedSource = {
  label: 'proof' as const,
  url: 'https://crm.acme.com',
  classification: 'twenty-instance' as const,
  excerpt: 'Twenty',
  videoTitle: null,
  videoDescription: null,
  videoThumbnailUrl: null,
  captionExcerpt: null,
  failureReason: null,
};

const agentSuccess = (verdict: string) => ({
  success: true,
  error: null,
  result: {
    verdict,
    headline: 'Live Twenty instance with a real customer workflow.',
    evidence: 'crm.acme.com returns the Twenty app shell',
    flags: '',
    needsHumanLook: '',
  },
});

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  runAgentMock.mockReset();
  collectSourcesMock.mockReset();

  queryMock.mockResolvedValue(partnerNode());
  collectSourcesMock.mockResolvedValue([verifiedSource]);
  runAgentMock.mockResolvedValue(agentSuccess('STRONG'));
  mutationMock.mockResolvedValue({
    createNote: { id: 'note-1' },
    createNoteTarget: { id: 'target-1' },
    updatePartner: { id: PARTNER_ID },
  });
});

describe('preReviewPartner', () => {
  it('writes the dossier note before the verdict and never touches reviewed or validationStage', async () => {
    const client = new CoreApiClient();

    const result = await preReviewPartner(client, PARTNER_ID);

    expect(result).toMatchObject({ graded: true, verdict: 'STRONG' });

    const mutationArguments = mutationMock.mock.calls.map(([call]) => call);
    expect(Object.keys(mutationArguments[0])).toEqual(['createNote']);
    expect(Object.keys(mutationArguments[1])).toEqual(['createNoteTarget']);
    expect(Object.keys(mutationArguments[2])).toEqual(['updatePartner']);

    expect(mutationArguments[1].createNoteTarget.__args.data).toEqual({
      noteId: 'note-1',
      targetPartnerId: PARTNER_ID,
    });
    expect(mutationArguments[2].updatePartner.__args.data).toEqual({
      preReviewVerdict: 'STRONG',
    });
  });

  it('skips a record that already carries a verdict', async () => {
    queryMock.mockResolvedValue(partnerNode({ preReviewVerdict: 'WEAK' }));
    const client = new CoreApiClient();

    const result = await preReviewPartner(client, PARTNER_ID);

    expect(result).toEqual({ graded: false, reason: 'already-graded' });
    expect(collectSourcesMock).not.toHaveBeenCalled();
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('caps the verdict at WORTH_A_LOOK when nothing verified', async () => {
    collectSourcesMock.mockResolvedValue([
      { ...verifiedSource, classification: 'drive-or-filedrop' },
    ]);
    const client = new CoreApiClient();

    const result = await preReviewPartner(client, PARTNER_ID);

    expect(result).toMatchObject({ verdict: 'WORTH_A_LOOK' });
    expect(
      mutationMock.mock.calls.at(-1)?.[0].updatePartner.__args.data,
    ).toEqual({ preReviewVerdict: 'WORTH_A_LOOK' });
  });

  it('writes nothing when the agent call fails', async () => {
    runAgentMock.mockResolvedValue({
      success: false,
      error: 'Agent execution failed.',
      result: null,
    });
    const client = new CoreApiClient();

    const result = await preReviewPartner(client, PARTNER_ID);

    expect(result).toEqual({ graded: false, reason: 'agent-failed' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('writes nothing when the agent returns an unusable verdict', async () => {
    runAgentMock.mockResolvedValue(agentSuccess('MAYBE'));
    const client = new CoreApiClient();

    const result = await preReviewPartner(client, PARTNER_ID);

    expect(result).toEqual({ graded: false, reason: 'unparsable-agent-result' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('swallows a thrown error and reports it without writing', async () => {
    collectSourcesMock.mockRejectedValue(new Error('network exploded'));
    const client = new CoreApiClient();

    const result = await preReviewPartner(client, PARTNER_ID);

    expect(result).toMatchObject({ graded: false, reason: 'error' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('returns not-found when the record is gone', async () => {
    queryMock.mockResolvedValue({ partner: null });
    const client = new CoreApiClient();

    expect(await preReviewPartner(client, PARTNER_ID)).toEqual({
      graded: false,
      reason: 'not-found',
    });
  });
});
