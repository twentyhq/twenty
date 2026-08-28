import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  grantOpportunityVisibility,
  mergeApplicantPartnerUserIds,
} from './grant-opportunity-visibility.service';

const OPPORTUNITY_ID = 'opportunity-1';
const MEMBER_ID = 'member-1';
const OTHER_MEMBER_ID = 'member-2';

const oneOpportunity = (applicantPartnerUserIds: string[] | null) => ({
  opportunities: {
    edges: [{ node: { id: OPPORTUNITY_ID, applicantPartnerUserIds } }],
  },
});

describe('mergeApplicantPartnerUserIds', () => {
  it('appends unique ids and drops empty values', () => {
    expect(
      mergeApplicantPartnerUserIds([MEMBER_ID], [MEMBER_ID, OTHER_MEMBER_ID, '']),
    ).toEqual([MEMBER_ID, OTHER_MEMBER_ID]);
  });

  it('treats a null current list as empty', () => {
    expect(mergeApplicantPartnerUserIds(null, [MEMBER_ID])).toEqual([MEMBER_ID]);
  });
});

describe('grantOpportunityVisibility', () => {
  const query = vi.fn();
  const mutation = vi.fn();
  const client = { query, mutation } as unknown as CoreApiClient;

  beforeEach(() => {
    query.mockReset();
    mutation.mockReset();
    mutation.mockResolvedValue({});
  });

  it('appends the member id when the opportunity has no list yet', async () => {
    query.mockResolvedValue(oneOpportunity(null));

    const result = await grantOpportunityVisibility(
      client,
      OPPORTUNITY_ID,
      MEMBER_ID,
    );

    expect(result).toEqual({ granted: true });
    expect(mutation).toHaveBeenCalledWith({
      updateOpportunity: {
        __args: {
          id: OPPORTUNITY_ID,
          data: { applicantPartnerUserIds: [MEMBER_ID] },
        },
        id: true,
      },
    });
  });

  it('keeps existing members and appends the new one', async () => {
    query.mockResolvedValue(oneOpportunity([OTHER_MEMBER_ID]));

    const result = await grantOpportunityVisibility(
      client,
      OPPORTUNITY_ID,
      MEMBER_ID,
    );

    expect(result).toEqual({ granted: true });
    expect(mutation).toHaveBeenCalledWith({
      updateOpportunity: {
        __args: {
          id: OPPORTUNITY_ID,
          data: {
            applicantPartnerUserIds: [OTHER_MEMBER_ID, MEMBER_ID],
          },
        },
        id: true,
      },
    });
  });

  it('does not write when the member is already listed', async () => {
    query.mockResolvedValue(oneOpportunity([MEMBER_ID]));

    const result = await grantOpportunityVisibility(
      client,
      OPPORTUNITY_ID,
      MEMBER_ID,
    );

    expect(result).toEqual({ granted: false, already: true });
    expect(mutation).not.toHaveBeenCalled();
  });

  it('does not write when the opportunity is missing', async () => {
    query.mockResolvedValue({ opportunities: { edges: [] } });

    const result = await grantOpportunityVisibility(
      client,
      OPPORTUNITY_ID,
      MEMBER_ID,
    );

    expect(result).toEqual({ granted: false, reason: 'opportunity_missing' });
    expect(mutation).not.toHaveBeenCalled();
  });
});
