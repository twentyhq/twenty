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

      if (filter === OPPORTUNITY_A) {
        return Promise.resolve({
          opportunities: {
            edges: [
              {
                node: {
                  id: OPPORTUNITY_A,
                  applicantPartnerUserIds: [MEMBER_1],
                },
              },
            ],
          },
        });
      }

      return Promise.resolve({
        opportunities: {
          edges: [
            { node: { id: OPPORTUNITY_B, applicantPartnerUserIds: [MEMBER_1] } },
          ],
        },
      });
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
});
