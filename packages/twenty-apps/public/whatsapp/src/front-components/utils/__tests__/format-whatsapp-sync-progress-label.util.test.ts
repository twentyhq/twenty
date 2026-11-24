import { describe, expect, it } from 'vitest';

import { formatWhatsappSyncProgressLabel } from 'src/front-components/utils/format-whatsapp-sync-progress-label.util';

describe('formatWhatsappSyncProgressLabel', () => {
  it('pads single digits so the label keeps its width', () => {
    expect(formatWhatsappSyncProgressLabel(7)).toBe(' (7%)');
    expect(formatWhatsappSyncProgressLabel(42)).toBe('(42%)');
  });
});
