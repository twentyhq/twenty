import { describe, it, expect } from 'vitest';
import appConfig from 'src/application-config';
import tftSyncEvent from 'src/objects/tft-sync-event.object';
import tftSyncCursor from 'src/objects/tft-sync-cursor.object';

describe('schema', () => {
  it('app config has universalIdentifier', () => {
    expect(appConfig.universalIdentifier).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('tft-sync-event object is defined', () => {
    expect(tftSyncEvent.nameSingular).toBe('tftSyncEvent');
  });

  it('tft-sync-cursor object is defined', () => {
    expect(tftSyncCursor.nameSingular).toBe('tftSyncCursor');
  });
});
