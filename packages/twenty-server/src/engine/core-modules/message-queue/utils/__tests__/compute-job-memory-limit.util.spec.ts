import {
  computeJobMemoryAvailableBytes,
  computeJobMemoryCapacityBytes,
  computeJobMemoryLimitBytes,
} from 'src/engine/core-modules/message-queue/utils/compute-job-memory-limit.util';

describe('computeJobMemoryCapacityBytes', () => {
  it('removes the reserve from maxmemory', () => {
    expect(
      computeJobMemoryCapacityBytes({ maxMemoryBytes: 1000, reserve: 0.2 }),
    ).toBe(800);
  });
});

describe('computeJobMemoryLimitBytes', () => {
  it('gives a share of the memory left free by every other group key', () => {
    expect(
      computeJobMemoryLimitBytes({
        capacityBytes: 800,
        usedMemoryBytes: 300,
        groupKeyUsedBytes: 100,
        share: 0.1,
      }),
    ).toBe(60);
  });

  it('never goes below zero when others already exceed the capacity', () => {
    expect(
      computeJobMemoryLimitBytes({
        capacityBytes: 800,
        usedMemoryBytes: 1000,
        groupKeyUsedBytes: 0,
        share: 0.1,
      }),
    ).toBe(0);
  });

  it('keeps n saturated tenants below capacity', () => {
    const capacityBytes = 1_000_000;
    const share = 0.1;
    const tenantCount = 20;
    const usedBytes = Array.from({ length: tenantCount }, () => 0);

    // Each tenant in turn fills up to its limit given what the others hold
    for (let round = 0; round < 200; round += 1) {
      for (let index = 0; index < tenantCount; index += 1) {
        usedBytes[index] = computeJobMemoryLimitBytes({
          capacityBytes,
          usedMemoryBytes: usedBytes.reduce((total, bytes) => total + bytes, 0),
          groupKeyUsedBytes: usedBytes[index],
          share,
        });
      }
    }

    const expectedShare = share / (1 + share * (tenantCount - 1));
    const total = usedBytes.reduce((sum, bytes) => sum + bytes, 0);

    expect(total).toBeLessThan(capacityBytes);
    usedBytes.forEach((bytes) =>
      expect(bytes / capacityBytes).toBeCloseTo(expectedShare, 2),
    );
  });
});

describe('computeJobMemoryAvailableBytes', () => {
  it('returns the smallest headroom across group keys', () => {
    expect(
      computeJobMemoryAvailableBytes([
        { usedBytes: 10, limitBytes: 100 },
        { usedBytes: 50, limitBytes: 70 },
      ]),
    ).toBe(20);
  });

  it('clamps to zero', () => {
    expect(
      computeJobMemoryAvailableBytes([{ usedBytes: 150, limitBytes: 100 }]),
    ).toBe(0);
  });

  it('is null without group keys', () => {
    expect(computeJobMemoryAvailableBytes([])).toBeNull();
  });
});
