import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { grantOpportunityVisibility } from './grant-opportunity-visibility.service';

const OPPORTUNITY_ID = 'opportunity-1';
const MEMBER_ID = 'member-1';
const OTHER_MEMBER_ID = 'member-2';

const oneOpportunity = (applicantPartnerUserIds: string[] | null) => ({
  opportunities: {
    edges: [{ node: { id: OPPORTUNITY_ID, applicantPartnerUserIds } }],
  },
});

const updateCall = (applicantPartnerUserIds: string[]) => ({
  updateOpportunity: {
    __args: {
      id: OPPORTUNITY_ID,
      data: { applicantPartnerUserIds },
    },
    id: true,
  },
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
    query
      .mockResolvedValueOnce(oneOpportunity(null))
      .mockResolvedValueOnce(oneOpportunity([MEMBER_ID]));

    const result = await grantOpportunityVisibility(client, OPPORTUNITY_ID, [
      MEMBER_ID,
    ]);

    expect(result).toEqual({ granted: true });
    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation).toHaveBeenCalledWith(updateCall([MEMBER_ID]));
  });

  it('keeps existing members and appends the new one', async () => {
    query
      .mockResolvedValueOnce(oneOpportunity([OTHER_MEMBER_ID]))
      .mockResolvedValueOnce(
        oneOpportunity([OTHER_MEMBER_ID, MEMBER_ID]),
      );

    const result = await grantOpportunityVisibility(client, OPPORTUNITY_ID, [
      MEMBER_ID,
    ]);

    expect(result).toEqual({ granted: true });
    expect(mutation).toHaveBeenCalledTimes(1);
    expect(mutation).toHaveBeenCalledWith(
      updateCall([OTHER_MEMBER_ID, MEMBER_ID]),
    );
  });

  it('does not write when every incoming member is already listed', async () => {
    query.mockResolvedValue(oneOpportunity([MEMBER_ID]));

    const result = await grantOpportunityVisibility(client, OPPORTUNITY_ID, [
      MEMBER_ID,
    ]);

    expect(result).toEqual({ granted: false, already: true });
    expect(mutation).not.toHaveBeenCalled();
  });

  it('does not write when the opportunity is missing', async () => {
    query.mockResolvedValue({ opportunities: { edges: [] } });

    const result = await grantOpportunityVisibility(client, OPPORTUNITY_ID, [
      MEMBER_ID,
    ]);

    expect(result).toEqual({ granted: false, reason: 'opportunity_missing' });
    expect(mutation).not.toHaveBeenCalled();
  });

  it('does not write when opportunity or member ids are missing', async () => {
    const result = await grantOpportunityVisibility(client, '', [MEMBER_ID]);

    expect(result).toEqual({ granted: false, reason: 'missing_ids' });
    expect(query).not.toHaveBeenCalled();
    expect(mutation).not.toHaveBeenCalled();
  });

  it('writes a second time when a concurrent grant dropped the member id', async () => {
    query
      .mockResolvedValueOnce(oneOpportunity(null))
      .mockResolvedValueOnce(oneOpportunity([OTHER_MEMBER_ID]))
      .mockResolvedValueOnce(
        oneOpportunity([OTHER_MEMBER_ID, MEMBER_ID]),
      );

    const result = await grantOpportunityVisibility(client, OPPORTUNITY_ID, [
      MEMBER_ID,
    ]);

    expect(result).toEqual({ granted: true });
    expect(mutation).toHaveBeenCalledTimes(2);
    expect(mutation).toHaveBeenNthCalledWith(1, updateCall([MEMBER_ID]));
    expect(mutation).toHaveBeenNthCalledWith(
      2,
      updateCall([OTHER_MEMBER_ID, MEMBER_ID]),
    );
  });

  it('throws when the member id is still missing after concurrent writes', async () => {
    query.mockResolvedValue(oneOpportunity([OTHER_MEMBER_ID]));

    await expect(
      grantOpportunityVisibility(client, OPPORTUNITY_ID, [MEMBER_ID]),
    ).rejects.toThrow(/still missing member-1/);

    expect(mutation).toHaveBeenCalledTimes(2);
  });

  it('does not claim a grant when the opportunity disappears after the write', async () => {
    query
      .mockResolvedValueOnce(oneOpportunity(null))
      .mockResolvedValueOnce({ opportunities: { edges: [] } });

    const result = await grantOpportunityVisibility(client, OPPORTUNITY_ID, [
      MEMBER_ID,
    ]);

    expect(result).toEqual({ granted: false, reason: 'opportunity_missing' });
    expect(mutation).toHaveBeenCalledTimes(1);
  });
});
