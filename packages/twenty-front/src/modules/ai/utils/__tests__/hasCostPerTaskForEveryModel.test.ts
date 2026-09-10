import { hasCostPerTaskForEveryModel } from '@/ai/utils/hasCostPerTaskForEveryModel';

describe('hasCostPerTaskForEveryModel', () => {
  it('is true when every resolved model carries a cost per task', () => {
    expect(
      hasCostPerTaskForEveryModel([{ costPerTask: 0.1 }, { costPerTask: 2.3 }]),
    ).toBe(true);
  });

  it('is false as soon as one resolved model has no cost per task', () => {
    expect(hasCostPerTaskForEveryModel([{ costPerTask: 0.1 }, {}])).toBe(false);
  });

  it('ignores tiers that resolved to no model', () => {
    expect(hasCostPerTaskForEveryModel([undefined, { costPerTask: 0.1 }])).toBe(
      true,
    );
  });

  it('is true with nothing to compare', () => {
    expect(hasCostPerTaskForEveryModel([])).toBe(true);
  });
});
