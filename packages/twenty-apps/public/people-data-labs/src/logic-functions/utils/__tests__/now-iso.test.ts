import { describe, expect, it } from 'vitest';

import { nowIso } from 'src/logic-functions/utils/now-iso';

describe('nowIso', () => {
  it('returns an ISO-8601 timestamp string', () => {
    expect(nowIso()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
