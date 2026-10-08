import { countBlocksDeep } from '@/blocknote-editor/utils/countBlocksDeep';

describe('countBlocksDeep', () => {
  it('should count nothing when there is nothing', () => {
    expect(countBlocksDeep(undefined)).toBe(0);
    expect(countBlocksDeep([])).toBe(0);
  });

  it('should count top level blocks', () => {
    expect(countBlocksDeep([{}, {}])).toBe(2);
  });

  it('should count nested children', () => {
    expect(countBlocksDeep([{ children: [{}, { children: [{}] }] }, {}])).toBe(
      5,
    );
  });
});
