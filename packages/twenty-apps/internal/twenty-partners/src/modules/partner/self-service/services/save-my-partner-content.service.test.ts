import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

import { saveMyPartnerContent } from './save-my-partner-content.service';

const USER_ID = 'user-1';
const USER_WORKSPACE_ID = 'user-workspace-1';
const WORKSPACE_MEMBER_ID = 'member-1';
const PARTNER_ID = 'partner-1';

const APP_TOKEN = `header.${Buffer.from(
  JSON.stringify({ userId: USER_ID, userWorkspaceId: USER_WORKSPACE_ID }),
).toString('base64url')}.sig`;

const QUERY_RESPONSES: Record<string, unknown> = {
  workspaceMembers: { edges: [{ node: { id: WORKSPACE_MEMBER_ID } }] },
  partners: { edges: [{ node: { id: PARTNER_ID, name: 'Atlas' } }] },
  partnerContents: { edges: [] },
};

const routeEvent = (body: unknown): RoutePayload<unknown> =>
  ({ body, userWorkspaceId: USER_WORKSPACE_ID }) as RoutePayload<unknown>;

describe('saveMyPartnerContent', () => {
  const originalToken = process.env.TWENTY_APP_ACCESS_TOKEN;

  afterEach(() => {
    if (originalToken === undefined) delete process.env.TWENTY_APP_ACCESS_TOKEN;
    else process.env.TWENTY_APP_ACCESS_TOKEN = originalToken;
  });

  beforeEach(() => {
    queryMock.mockReset();
    mutationMock.mockReset();
    process.env.TWENTY_APP_ACCESS_TOKEN = APP_TOKEN;
    mutationMock.mockResolvedValue({
      createPartnerContent: { id: 'content-1' },
    });
    queryMock.mockImplementation((selection: Record<string, unknown>) => {
      const key = Object.keys(selection)[0] as string;
      return Promise.resolve({ [key]: QUERY_RESPONSES[key] });
    });
  });

  it('creates with the authenticated partnerUserId so RLS accepts the insert', async () => {
    const result = await saveMyPartnerContent(
      routeEvent({
        caseStudies: [
          {
            name: 'Atlas rollout',
            clientName: 'Acme',
            headline: 'A migration',
            bodyMarkdown: 'How Acme migrated.',
            caseStudyLink: 'https://example.com/atlas',
            coverImageUrl: 'https://cdn.example.com/cover.png',
            published: false,
          },
        ],
      }),
    );

    expect(result).toMatchObject({
      ok: true,
      caseStudies: [{ id: 'content-1', name: 'Atlas rollout', status: 'WIP' }],
    });
    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledWith({
      createPartnerContent: {
        __args: {
          data: expect.objectContaining({
            name: 'Atlas rollout',
            partnerUserId: WORKSPACE_MEMBER_ID,
            status: 'WIP',
          }),
        },
        id: true,
      },
    });

    const createData =
      mutationMock.mock.calls[0][0].createPartnerContent.__args.data;
    expect(createData).not.toHaveProperty('partnerId');
    expect(createData).not.toHaveProperty('contentType');
  });

  it('never reads partnerUserId from the request body', async () => {
    await saveMyPartnerContent(
      routeEvent({
        caseStudies: [
          {
            name: 'Atlas rollout',
            partnerUserId: 'spoofed-member',
            partnerId: 'spoofed-partner',
          },
        ],
      }),
    );

    expect(mutationMock).toHaveBeenCalledTimes(1);

    const createData =
      mutationMock.mock.calls[0][0].createPartnerContent.__args.data;
    expect(createData.partnerUserId).toBe(WORKSPACE_MEMBER_ID);
    expect(createData).not.toHaveProperty('partnerId');
  });
});
