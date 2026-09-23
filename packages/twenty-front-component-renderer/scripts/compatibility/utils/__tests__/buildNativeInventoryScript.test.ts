import { runInNewContext } from 'node:vm';

import { buildNativeInventoryScript } from '../buildNativeInventoryScript';

describe('buildNativeInventoryScript', () => {
  it('returns the collector result as JSON', () => {
    expect(
      runInNewContext(
        buildNativeInventoryScript(
          'var inventoryReference = { nativeInventory: () => ({ targets: 1 }) };',
        ),
      ),
    ).toBe('{"targets":1}');
  });

  it('keeps the bundle global name inside the evaluated script', () => {
    const context = {};
    runInNewContext(
      buildNativeInventoryScript(
        'var inventoryReference = { nativeInventory: () => ({}) };',
      ),
      context,
    );
    expect(Object.keys(context)).toEqual([]);
  });

  it('rejects a collector that adds reference globals', () => {
    expect(() =>
      runInNewContext(
        buildNativeInventoryScript(
          'var inventoryReference = { nativeInventory: () => { globalThis.leakedGlobal = true; return {}; } };',
        ),
      ),
    ).toThrow('Native collector changed the reference globals');
  });
});
