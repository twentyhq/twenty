import { computeDepth } from 'src/engine/api/rest/core/query-builder/utils/compute-depth.utils';

describe('computeDepth', () => {
  [0, 1].forEach((depth) => {
    it('should compute depth from query', () => {
      const request: any = {
        query: { depth: `${depth}` },
      };

      expect(computeDepth(request)).toEqual(depth);
    });
  });

  it('should return default depth if missing', () => {
    const request: any = { query: {} };

    expect(computeDepth(request)).toEqual(undefined);
  });
  it('should raise if wrong depth', () => {
    const request: any = { query: { depth: '100' } };

    expect(() => computeDepth(request)).toThrow();

    request.query.depth = '-1';

    expect(() => computeDepth(request)).toThrow();
  });
});
