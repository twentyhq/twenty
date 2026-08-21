import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

import { MIN_PITCH_LENGTH } from '../constants/apply-to-brief.constants';
import { applyToBrief } from '../services/apply-to-brief.service';

const USER_ID = 'user-1';
const USER_WORKSPACE_ID = 'user-workspace-1';
const WORKSPACE_MEMBER_ID = 'member-1';
const PARTNER_ID = 'partner-1';
const OPPORTUNITY_ID = 'opportunity-1';

const originalToken = process.env.TWENTY_APP_ACCESS_TOKEN;
const payload = Buffer.from(
  JSON.stringify({ userId: USER_ID, userWorkspaceId: USER_WORKSPACE_ID }),
).toString('base64url');
process.env.TWENTY_APP_ACCESS_TOKEN = `header.${payload}.sig`;

afterAll(() => {
  if (originalToken === undefined) delete process.env.TWENTY_APP_ACCESS_TOKEN;
  else process.env.TWENTY_APP_ACCESS_TOKEN = originalToken;
});

type QueryResponses = {
  workspaceMembers?: unknown;
  partners?: unknown;
  opportunity?: unknown;
  applications?: unknown;
  partner?: unknown;
};

const defaultResponses = (): QueryResponses => ({
  workspaceMembers: { edges: [{ node: { id: WORKSPACE_MEMBER_ID } }] },
  partners: { edges: [{ node: { id: PARTNER_ID } }] },
  opportunity: { id: OPPORTUNITY_ID, name: 'Q3 Renewal', isListed: true },
  applications: { edges: [] },
  partner: { id: PARTNER_ID, name: 'Acme Partners' },
});

const respondWith = (overrides: QueryResponses = {}) => {
  const responses = { ...defaultResponses(), ...overrides };
  queryMock.mockImplementation((selection: Record<string, unknown>) => {
    const key = Object.keys(selection)[0] as keyof QueryResponses;
    return Promise.resolve({ [key]: responses[key] });
  });
};

const pitchOf = (length: number) => 'a'.repeat(length);

const event = (body: unknown, userWorkspaceId: string | null = USER_WORKSPACE_ID) =>
  ({ body, userWorkspaceId }) as never;

const validBody = { opportunityId: OPPORTUNITY_ID, pitch: pitchOf(MIN_PITCH_LENGTH) };

describe('applyToBrief', () => {
  beforeEach(() => {
    queryMock.mockReset();
    mutationMock.mockReset();
    mutationMock.mockResolvedValue({ createApplication: { id: 'application-1' } });
    respondWith();
  });

  it('refuses an unauthenticated caller without creating anything', async () => {
    const result = await applyToBrief(event(validBody, null));

    expect(result).toEqual({ ok: false, reason: 'UNAUTHENTICATED' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses a caller with no partner without creating anything', async () => {
    respondWith({ partners: { edges: [] } });

    const result = await applyToBrief(event(validBody));

    expect(result).toEqual({ ok: false, reason: 'NO_PARTNER' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses a brief that is not listed without creating anything', async () => {
    respondWith({ opportunity: { id: OPPORTUNITY_ID, name: 'Q3 Renewal', isListed: false } });

    const result = await applyToBrief(event(validBody));

    expect(result).toEqual({ ok: false, reason: 'BRIEF_NOT_OPEN' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses a brief that does not exist without creating anything', async () => {
    respondWith({ opportunity: null });

    const result = await applyToBrief(event(validBody));

    expect(result).toEqual({ ok: false, reason: 'BRIEF_NOT_OPEN' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses a body without an opportunityId without creating anything', async () => {
    const result = await applyToBrief(event({ pitch: pitchOf(MIN_PITCH_LENGTH) }));

    expect(result).toEqual({ ok: false, reason: 'BRIEF_NOT_OPEN' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses a pitch one character below the minimum after trim', async () => {
    const pitch = ` ${pitchOf(MIN_PITCH_LENGTH - 1)} `;

    const result = await applyToBrief(event({ opportunityId: OPPORTUNITY_ID, pitch }));

    expect(result).toEqual({ ok: false, reason: 'PITCH_TOO_SHORT' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses a duplicate application without creating anything', async () => {
    respondWith({ applications: { edges: [{ node: { id: 'existing-application' } }] } });

    const result = await applyToBrief(event(validBody));

    expect(result).toEqual({ ok: false, reason: 'ALREADY_APPLIED' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('creates the application once with the five derived fields', async () => {
    const pitch = `  ${pitchOf(MIN_PITCH_LENGTH + 20)}  `;

    const result = await applyToBrief(event({ opportunityId: OPPORTUNITY_ID, pitch }));

    expect(result).toEqual({ ok: true, applicationId: 'application-1' });
    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledWith({
      createApplication: {
        __args: {
          data: {
            opportunityId: OPPORTUNITY_ID,
            partnerId: PARTNER_ID,
            partnerUserId: WORKSPACE_MEMBER_ID,
            pitch: pitch.trim(),
            name: 'Acme Partners · Q3 Renewal',
          },
        },
        id: true,
      },
    });
  });

  it('accepts a pitch of exactly the minimum length', async () => {
    const result = await applyToBrief(
      event({ opportunityId: OPPORTUNITY_ID, pitch: pitchOf(MIN_PITCH_LENGTH) }),
    );

    expect(result).toEqual({ ok: true, applicationId: 'application-1' });
    expect(mutationMock).toHaveBeenCalledTimes(1);
  });

  it('never reads partnerId or partnerUserId from the request body', async () => {
    await applyToBrief(
      event({
        ...validBody,
        partnerId: 'spoofed-partner',
        partnerUserId: 'spoofed-member',
      }),
    );

    expect(mutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        createApplication: expect.objectContaining({
          __args: {
            data: expect.objectContaining({
              partnerId: PARTNER_ID,
              partnerUserId: WORKSPACE_MEMBER_ID,
            }),
          },
        }),
      }),
    );
  });
});
