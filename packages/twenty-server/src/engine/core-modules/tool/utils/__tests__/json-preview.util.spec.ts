import { jsonPreview } from 'src/engine/core-modules/tool/utils/json-preview.util';

describe('jsonPreview', () => {
  it('keeps concrete scalar values', () => {
    expect(
      jsonPreview({ id: 'abc', count: 3, active: true, deleted: null }),
    ).toEqual({ id: 'abc', count: 3, active: true, deleted: null });
  });

  it('keeps every object key so the schema is visible', () => {
    const result = jsonPreview({
      a: 1,
      b: 'two',
      c: true,
      d: null,
      e: 5,
      f: 6,
      g: 7,
    }) as Record<string, unknown>;

    expect(Object.keys(result)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
  });

  it('limits arrays to the first items and notes the remaining count', () => {
    const result = jsonPreview({
      items: Array.from({ length: 10 }, (_, index) => ({ id: index })),
    }) as { items: unknown[] };

    expect(result.items).toEqual([
      { id: 0 },
      { id: 1 },
      { id: 2 },
      '... (7 more items)',
    ]);
  });

  it('collapses dynamic-key maps whose values share a shape', () => {
    const failedStepLogs: Record<string, unknown> = {};

    for (let index = 0; index < 8; index++) {
      failedStepLogs[`step-${index}`] = { reason: 'x' };
    }

    const result = jsonPreview({ failedStepLogs }) as {
      failedStepLogs: Record<string, unknown>;
    };

    const keys = Object.keys(result.failedStepLogs);

    expect(keys).toHaveLength(2);
    expect(keys).toContain('step-0');
    expect(keys).toContain('... (7 more keys)');
  });

  it('does not collapse maps whose values have differing shapes', () => {
    const result = jsonPreview({
      a: { x: 1 },
      b: { y: 1 },
      c: { z: 1 },
      d: [1],
      e: 'str',
      f: 3,
    }) as Record<string, unknown>;

    expect(Object.keys(result)).toHaveLength(6);
  });

  it('truncates long leaf strings', () => {
    const result = jsonPreview({ payload: 'a'.repeat(500) }) as {
      payload: string;
    };

    expect(result.payload).toContain('truncated');
    expect(result.payload).toContain('total');
  });

  it('keeps the serialized preview under the hard cap', () => {
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

    const result = jsonPreview(deeplyNested);

    expect(Buffer.byteLength(JSON.stringify(result))).toBeLessThanOrEqual(2048);
  });
});
