import { describe, expect, it } from 'vitest';

import { canRenderWithCameraTileFont } from 'src/logic-functions/utils/can-render-with-camera-tile-font.util';

describe('canRenderWithCameraTileFont', () => {
  it.each([
    'Acme Inc.',
    'Société Générale',
    'Straße & Co',
    'Αθήνα',
    'Яндекс',
    'R&D 2026',
  ])('accepts %s', (text) => {
    expect(canRenderWithCameraTileFont(text)).toBe(true);
  });

  it.each(['日本商事', 'شركة', 'Acme 🚀', 'Acme 🇫🇷', 'Team 1️⃣', 'שלום'])(
    'rejects %s',
    (text) => {
      expect(canRenderWithCameraTileFont(text)).toBe(false);
    },
  );
});
