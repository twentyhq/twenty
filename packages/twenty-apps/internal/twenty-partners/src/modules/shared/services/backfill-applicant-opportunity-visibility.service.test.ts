import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { backfillApplicantOpportunityVisibility } from './backfill-applicant-opportunity-visibility.service';

const OPPORTUNITY_A = 'opportunity-a';
const OPPORTUNITY_B = 'opportunity-b';
const MEMBER_1 = 'member-1';
const MEMBER_2 = 'member-2';

describe('backfillApplicantOpportunityVisibility', () => {
  const query = vi.fn();
  const mutation = vi.fn();
  const client = { query, mutation } as unknown as CoreApiClient;

  beforeEach(() => {
    query.mockReset();
    mutation.mockReset();
    mutation.mockResolvedValue({});
  });

  it('writes one merged list per opportunity and skips ids that are already present', async () => {
    const applicantIdsByOpportunity = new Map<string, string[]>([
      [OPPORTUNITY_A, [MEMBER_1]],
      [OPPORTUNITY_B, [MEMBER_1]],
    ]);

    query.mockImplementation((selection: Record<string, unknown>) => {
      if (selection.applications) {
        return Promise.resolve({
          applications: {
            edges: [
              {
                node: {
                  id: 'app-1',
                  opportunityId: OPPORTUNITY_A,
                  partnerUserId: MEMBER_1,
                },
              },
              {
                node: {
                  id: 'app-2',
                  opportunityId: OPPORTUNITY_A,
                  partnerUserId: MEMBER_2,
                },
              },
              {
                node: {
                  id: 'app-3',
                  opportunityId: OPPORTUNITY_B,
                  partnerUserId: MEMBER_1,
                },
              },
              { node: { id: 'app-4', opportunityId: null, partnerUserId: MEMBER_1 } },
            ],
            pageInfo: { hasNextPage: false },
          },
        });
      }

      const filter = (
        selection.opportunities as {
          __args?: { filter?: { id?: { eq?: string } } };
        }
      )?.__args?.filter?.id?.eq;

      if (!filter) {
        return Promise.resolve({ opportunities: { edges: [] } });
      }

      return Promise.resolve({
        opportunities: {
          edges: [
            {
              node: {
                id: filter,
                applicantPartnerUserIds:
                  applicantIdsByOpportunity.get(filter) ?? [],
              },
            },
          ],
        },
      });
    });

    mutation.mockImplementation((selection: Record<string, unknown>) => {
      const args = (
        selection.updateOpportunity as {
          __args?: { id?: string; data?: { applicantPartnerUserIds?: string[] } };
        }
      )?.__args;

      if (args?.id && args.data?.applicantPartnerUserIds) {
        applicantIdsByOpportunity.set(args.id, args.data.applicantPartnerUserIds);
      }

      return Promise.resolve({});
    });

    const updated = await backfillApplicantOpportunityVisibility(client);

    expect(updated).toBe(1);
    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation).toHaveBeenCalledWith({
      updateOpportunity: {
        __args: {
          id: OPPORTUNITY_A,
          data: { applicantPartnerUserIds: [MEMBER_1, MEMBER_2] },
        },
        id: true,
      },
    });
  });

  it('returns 0 when no application has both an opportunity and a partner user', async () => {
    query.mockResolvedValue({
      applications: { edges: [], pageInfo: { hasNextPage: false } },
    });

    const updated = await backfillApplicantOpportunityVisibility(client);

    expect(updated).toBe(0);
    expect(mutation).not.toHaveBeenCalled();
  });

  it('follows the cursor across pages and merges rows from every page', async () => {
    const applicationPages: Record<string, unknown> = {
      first: {
        applications: {
          edges: [
            {
              node: { opportunityId: OPPORTUNITY_A, partnerUserId: MEMBER_1 },
            },
          ],
          pageInfo: { hasNextPage: true, endCursor: 'cursor-1' },
        },
      },
      second: {
        applications: {
          edges: [
            {
              node: { opportunityId: OPPORTUNITY_A, partnerUserId: MEMBER_2 },
            },
          ],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    };
    const seenCursors: (string | undefined)[] = [];
    const applicantIdsByOpportunity = new Map<string, string[]>();

    query.mockImplementation((selection: Record<string, unknown>) => {
      if (selection.applications) {
        const after = (
          selection.applications as { __args?: { after?: string } }
        )?.__args?.after;

        seenCursors.push(after);

        return Promise.resolve(
          after === 'cursor-1'
            ? applicationPages.second
            : applicationPages.first,
        );
      }

      const requestedId = (
        selection.opportunities as {
          __args?: { filter?: { id?: { eq?: string } } };
        }
      )?.__args?.filter?.id?.eq;

      return Promise.resolve({
        opportunities: {
          edges: [
            {
              node: {
                id: requestedId,
                applicantPartnerUserIds:
                  applicantIdsByOpportunity.get(requestedId ?? '') ?? [],
              },
            },
          ],
        },
      });
    });

    mutation.mockImplementation((selection: Record<string, unknown>) => {
      const args = (
        selection.updateOpportunity as {
          __args?: { id?: string; data?: { applicantPartnerUserIds?: string[] } };
        }
      )?.__args;

      if (args?.id && args.data?.applicantPartnerUserIds) {
        applicantIdsByOpportunity.set(args.id, args.data.applicantPartnerUserIds);
      }

      return Promise.resolve({});
    });

    const updated = await backfillApplicantOpportunityVisibility(client);

    expect(seenCursors).toEqual([undefined, 'cursor-1']);
    expect(updated).toBe(1);
    expect(mutation).toHaveBeenCalledWith({
      updateOpportunity: {
        __args: {
          id: OPPORTUNITY_A,
          data: { applicantPartnerUserIds: [MEMBER_1, MEMBER_2] },
        },
        id: true,
      },
    });
  });

  it('grants the healthy opportunities, then fails loudly so the upgrade can be re-run', async () => {
    const applicantIdsByOpportunity = new Map<string, string[]>();

    query.mockImplementation((selection: Record<string, unknown>) => {
      if (selection.applications) {
        return Promise.resolve({
          applications: {
            edges: [
              {
                node: {
                  id: 'app-1',
                  opportunityId: OPPORTUNITY_A,
                  partnerUserId: MEMBER_1,
                },
              },
              {
                node: {
                  id: 'app-2',
                  opportunityId: OPPORTUNITY_B,
                  partnerUserId: MEMBER_2,
                },
              },
            ],
            pageInfo: { hasNextPage: false },
          },
        });
      }

      const requestedId = (
        selection.opportunities as {
          __args?: { filter?: { id?: { eq?: string } } };
        }
      )?.__args?.filter?.id?.eq;

      if (requestedId === OPPORTUNITY_A) {
        return Promise.reject(new Error('boom'));
      }

      return Promise.resolve({
        opportunities: {
          edges: [
            {
              node: {
                id: requestedId,
                applicantPartnerUserIds:
                  applicantIdsByOpportunity.get(requestedId ?? '') ?? [],
              },
            },
          ],
        },
      });
    });

    mutation.mockImplementation((selection: Record<string, unknown>) => {
      const args = (
        selection.updateOpportunity as {
          __args?: { id?: string; data?: { applicantPartnerUserIds?: string[] } };
        }
      )?.__args;

      if (args?.id && args.data?.applicantPartnerUserIds) {
        applicantIdsByOpportunity.set(args.id, args.data.applicantPartnerUserIds);
      }

      return Promise.resolve({});
    });

    await expect(
      backfillApplicantOpportunityVisibility(client),
    ).rejects.toThrow(/failed for 1 of 2 opportunities/);

    expect(mutation).toHaveBeenCalledWith({
      updateOpportunity: {
        __args: {
          id: OPPORTUNITY_B,
          data: { applicantPartnerUserIds: [MEMBER_2] },
        },
        id: true,
      },
    });
  });
});
