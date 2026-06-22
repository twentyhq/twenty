import { jsonShapeSkeleton } from 'src/engine/core-modules/tool/utils/json-shape-skeleton.util';

describe('jsonShapeSkeleton', () => {
  it('collapses scalars to their type names', () => {
    expect(
      jsonShapeSkeleton({
        id: 'abc',
        count: 3,
        active: true,
        deleted: null,
      }),
    ).toEqual({
      id: 'string',
      count: 'number',
      active: 'boolean',
      deleted: 'null',
    });
  });

  it('collapses scalar arrays to length plus element type and recurses into object elements', () => {
    expect(
      jsonShapeSkeleton({
        steps: [{ id: 'a' }, { id: 'b' }],
        tags: ['x', 'y', 'z'],
        empty: [],
      }),
    ).toEqual({
      steps: { length: 2, '[*]': { id: 'string' } },
      tags: 'array[3] of string',
      empty: 'array[0]',
    });
  });

  it('marks long string leaves with their size', () => {
    const longString = 'a'.repeat(2500);

    const result = jsonShapeSkeleton({ payload: longString }) as Record<
      string,
      string
    >;

    expect(result.payload).toBe('string (2.4 kB)');
  });

  it('collapses id-keyed maps to one representative key', () => {
    const failedStepLogs: Record<string, unknown> = {};

    for (let index = 0; index < 8; index++) {
      failedStepLogs[`step-${index}`] = {
        details: { reason: 'x' },
        entries: [1, 2, 3],
      };
    }

    const result = jsonShapeSkeleton({ failedStepLogs }) as {
      failedStepLogs: Record<string, unknown>;
    };

    const keys = Object.keys(result.failedStepLogs);

    expect(keys).toHaveLength(2);
    expect(keys).toContain('step-0');
    expect(keys).toContain('... (7 more keys)');
  });

  it('does not collapse objects whose values have differing shapes', () => {
    const result = jsonShapeSkeleton({
      a: { x: 1 },
      b: { y: 1 },
      c: { z: 1 },
      d: [1],
      e: 'str',
      f: 3,
    }) as Record<string, unknown>;

    expect(Object.keys(result)).toHaveLength(6);
  });

  it('keeps the serialized skeleton under the 1024-byte hard cap', () => {
    const deeplyNested: Record<string, unknown> = {};
    let cursor = deeplyNested;

    for (let index = 0; index < 20; index++) {
      const child: Record<string, unknown> = {
        field0: 'value',
        field1: 'value',
        field2: 'value',
      };

      cursor[`level-${index}`] = child;
      cursor = child;
    }

    const result = jsonShapeSkeleton(deeplyNested);

    expect(Buffer.byteLength(JSON.stringify(result))).toBeLessThanOrEqual(1024);
  });
});
