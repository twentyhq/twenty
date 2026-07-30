import { beforeEach, describe, expect, it, vi } from 'vitest';

const recomputePeople = vi.fn().mockResolvedValue(0);
const recomputeCompanies = vi.fn().mockResolvedValue(0);
const recomputeOpportunities = vi.fn().mockResolvedValue(0);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock('src/logic-functions/handlers/recompute-people', () => ({
  recomputePeople,
}));
vi.mock('src/logic-functions/handlers/recompute-companies', () => ({
  recomputeCompanies,
}));
vi.mock('src/logic-functions/handlers/recompute-opportunities', () => ({
  recomputeOpportunities,
}));

const { handler } = await import(
  'src/logic-functions/recompute-last-contact'
);

describe('recompute-last-contact handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recomputePeople.mockResolvedValue(0);
    recomputeCompanies.mockResolvedValue(0);
    recomputeOpportunities.mockResolvedValue(0);
  });

  it('should dispatch people to the person handler', async () => {
    recomputePeople.mockResolvedValue(2);

    const result = await handler({
      objectNameSingular: 'person',
      recordIds: ['person-1', 'person-2'],
    });

    expect(recomputePeople).toHaveBeenCalledWith(expect.anything(), [
      'person-1',
      'person-2',
    ]);
    expect(recomputeCompanies).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      objectNameSingular: 'person',
      total: 2,
      updated: 2,
    });
  });

  it('should dispatch companies to the company handler', async () => {
    await handler({
      objectNameSingular: 'company',
      recordIds: ['company-1'],
    });

    expect(recomputeCompanies).toHaveBeenCalledWith(expect.anything(), [
      'company-1',
    ]);
  });

  it('should dispatch opportunities to the opportunity handler', async () => {
    await handler({
      objectNameSingular: 'opportunity',
      recordIds: ['opportunity-1'],
    });

    expect(recomputeOpportunities).toHaveBeenCalledWith(expect.anything(), [
      'opportunity-1',
    ]);
  });

  it('should answer 400 for an unknown target object', async () => {
    const result = await handler({
      objectNameSingular: 'note',
      recordIds: ['note-1'],
    } as never);

    expect(result).toMatchObject({
      status: 400,
      body: { success: false },
    });
    expect(recomputePeople).not.toHaveBeenCalled();
  });

  it('should answer 400 when more than 20 ids are sent', async () => {
    const recordIds = Array.from(
      { length: 21 },
      (_unused, index) => `person-${index}`,
    );

    const result = await handler({ objectNameSingular: 'person', recordIds });

    expect(result).toMatchObject({
      status: 400,
      body: { message: 'recordIds must contain at most 20 ids' },
    });
    expect(recomputePeople).not.toHaveBeenCalled();
  });

  it('should short-circuit an empty selection', async () => {
    const result = await handler({
      objectNameSingular: 'person',
      recordIds: [],
    });

    expect(result).toEqual({
      success: true,
      objectNameSingular: 'person',
      total: 0,
      updated: 0,
    });
    expect(recomputePeople).not.toHaveBeenCalled();
  });
});
