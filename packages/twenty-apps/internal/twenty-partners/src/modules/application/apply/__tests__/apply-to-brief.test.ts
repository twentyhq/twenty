import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock, metadataQueryMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
  metadataQueryMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: vi.fn(function () {
    return { query: metadataQueryMock };
  }),
}));

import { MIN_PITCH_LENGTH } from 'src/modules/application/apply/constants/apply-to-brief.constants';
import { applyToBrief } from 'src/modules/application/apply/services/apply-to-brief.service';

const USER_ID = 'user-1';
const WORKSPACE_ID = 'workspace-1';
const WORKSPACE_MEMBER_ID = 'member-1';
const PARTNER_ID = 'partner-1';
const PARTNER_NAME = 'Acme Partners';
const OPPORTUNITY_ID = 'opportunity-1';
const AUTHORIZATION = 'Bearer caller-token';

const APP_TOKEN = `header.${Buffer.from(
  JSON.stringify({ workspaceId: WORKSPACE_ID }),
).toString('base64url')}.sig`;

type QueryResponses = {
  workspaceMembers?: unknown;
  partners?: unknown;
  opportunities?: unknown;
  applications?: unknown;
};

const defaultResponses = (): QueryResponses => ({
  workspaceMembers: { edges: [{ node: { id: WORKSPACE_MEMBER_ID } }] },
  partners: { edges: [{ node: { id: PARTNER_ID, name: PARTNER_NAME } }] },
  opportunities: {
    edges: [
      { node: { id: OPPORTUNITY_ID, name: 'Q3 Renewal', isListed: true } },
    ],
  },
  applications: { edges: [] },
});

const respondWith = (overrides: QueryResponses = {}) => {
  const responses = { ...defaultResponses(), ...overrides };
  queryMock.mockImplementation((selection: Record<string, unknown>) => {
    const key = Object.keys(selection)[0] as keyof QueryResponses;
    return Promise.resolve({ [key as string]: responses[key] });
  });
};

const pitchOf = (length: number) => 'a'.repeat(length);

const event = (
  body: unknown,
  authorization: string | null = AUTHORIZATION,
) => ({
  body,
  headers: { authorization: authorization ?? undefined },
});

const validBody = {
  opportunityId: OPPORTUNITY_ID,
  pitch: pitchOf(MIN_PITCH_LENGTH),
};

describe('applyToBrief', () => {
  const originalAppToken = process.env.TWENTY_APP_ACCESS_TOKEN;
  afterEach(() => {
    if (originalAppToken === undefined)
      delete process.env.TWENTY_APP_ACCESS_TOKEN;
    else process.env.TWENTY_APP_ACCESS_TOKEN = originalAppToken;
  });

  beforeEach(() => {
    queryMock.mockReset();
    mutationMock.mockReset();
    metadataQueryMock.mockReset();
    process.env.TWENTY_APP_ACCESS_TOKEN = APP_TOKEN;
    metadataQueryMock.mockResolvedValue({
      currentUser: { id: USER_ID, currentWorkspace: { id: WORKSPACE_ID } },
    });
    mutationMock.mockResolvedValue({
      createApplication: { id: 'application-1' },
    });
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

  it('refuses a token minted in another workspace without creating anything', async () => {
    metadataQueryMock.mockResolvedValue({
      currentUser: { id: USER_ID, currentWorkspace: { id: 'workspace-other' } },
    });

    const result = await applyToBrief(event(validBody));

    expect(result).toEqual({ ok: false, reason: 'UNAUTHENTICATED' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses a brief that is not listed without creating anything', async () => {
    respondWith({
      opportunities: {
        edges: [
          { node: { id: OPPORTUNITY_ID, name: 'Q3 Renewal', isListed: false } },
        ],
      },
    });

    const result = await applyToBrief(event(validBody));

    expect(result).toEqual({ ok: false, reason: 'BRIEF_NOT_OPEN' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses a brief that does not exist without creating anything', async () => {
    respondWith({ opportunities: { edges: [] } });

    const result = await applyToBrief(event(validBody));

    expect(result).toEqual({ ok: false, reason: 'BRIEF_NOT_OPEN' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses a body without an opportunityId without creating anything', async () => {
    const result = await applyToBrief(
      event({ pitch: pitchOf(MIN_PITCH_LENGTH) }),
    );

    expect(result).toEqual({ ok: false, reason: 'BAD_REQUEST' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses a pitch one character below the minimum after trim', async () => {
    const pitch = ` ${pitchOf(MIN_PITCH_LENGTH - 1)} `;

    const result = await applyToBrief(
      event({ opportunityId: OPPORTUNITY_ID, pitch }),
    );

    expect(result).toEqual({ ok: false, reason: 'PITCH_TOO_SHORT' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('refuses an existing application that already carries a pitch', async () => {
    respondWith({
      applications: {
        edges: [
          {
            node: {
              id: 'existing-application',
              pitch: 'a real pitch',
              state: 'APPLIED',
            },
          },
        ],
      },
    });

    const result = await applyToBrief(event(validBody));

    expect(result).toEqual({ ok: false, reason: 'ALREADY_APPLIED' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it.each([['INTRODUCED'], ['WON'], ['DECLINED']])(
    'refuses to fill the pitch of a pitchless row already decided at %s',
    async (state) => {
      respondWith({
        applications: {
          edges: [{ node: { id: 'decided-application', pitch: null, state } }],
        },
      });

      const result = await applyToBrief(event(validBody));

      expect(result).toEqual({ ok: false, reason: 'BRIEF_NOT_OPEN' });
      expect(mutationMock).not.toHaveBeenCalled();
    },
  );

  it.each([['INVITED'], ['APPLIED'], ['BACKUP']])(
    'fills the pitch of a pitchless row still in the running at %s',
    async (state) => {
      respondWith({
        applications: {
          edges: [{ node: { id: 'live-application', pitch: null, state } }],
        },
      });

      const result = await applyToBrief(event(validBody));

      expect(result).toEqual({ ok: true, applicationId: 'live-application' });
    },
  );

  it.each([
    ['null', null],
    ['whitespace only', '   \n  '],
  ])(
    'fills the pitch of an existing row whose pitch is %s',
    async (_label, pitch) => {
      respondWith({
        applications: {
          edges: [
            { node: { id: 'invited-application', pitch, state: 'INVITED' } },
          ],
        },
      });
      const submittedPitch = `  ${pitchOf(MIN_PITCH_LENGTH)}  `;

      const result = await applyToBrief(
        event({ opportunityId: OPPORTUNITY_ID, pitch: submittedPitch }),
      );

      expect(result).toEqual({
        ok: true,
        applicationId: 'invited-application',
      });
      expect(mutationMock).toHaveBeenCalledTimes(1);
      expect(mutationMock).toHaveBeenCalledWith({
        updateApplication: {
          __args: {
            id: 'invited-application',
            data: { pitch: submittedPitch.trim() },
          },
          id: true,
        },
      });

      const data = mutationMock.mock.calls[0][0].updateApplication.__args.data;
      expect(Object.keys(data)).toEqual(['pitch']);
      expect(data).not.toHaveProperty('state');
    },
  );

  it('creates the application once with the five derived fields', async () => {
    const pitch = `  ${pitchOf(MIN_PITCH_LENGTH + 20)}  `;

    const result = await applyToBrief(
      event({ opportunityId: OPPORTUNITY_ID, pitch }),
    );

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
      event({
        opportunityId: OPPORTUNITY_ID,
        pitch: pitchOf(MIN_PITCH_LENGTH),
      }),
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
