import { describe, expect, it } from 'vitest';

import {
  FIREWALL_AI_CONTEXT_ALLOWLIST_ENABLED,
  FIREWALL_CLIENT_REPORT_SCAN_ENABLED,
  FIREWALL_PIPELINE_EXCLUSION_ENABLED,
  FIREWALL_SEARCH_EXCLUSION_ENABLED,
} from 'src/constants/firewall-feature-flags';

describe('firewall feature flags', () => {
  it.each([
    ['FIREWALL_SEARCH_EXCLUSION_ENABLED', FIREWALL_SEARCH_EXCLUSION_ENABLED],
    [
      'FIREWALL_AI_CONTEXT_ALLOWLIST_ENABLED',
      FIREWALL_AI_CONTEXT_ALLOWLIST_ENABLED,
    ],
    [
      'FIREWALL_CLIENT_REPORT_SCAN_ENABLED',
      FIREWALL_CLIENT_REPORT_SCAN_ENABLED,
    ],
    [
      'FIREWALL_PIPELINE_EXCLUSION_ENABLED',
      FIREWALL_PIPELINE_EXCLUSION_ENABLED,
    ],
  ])('%s is false', (_, flag) => {
    expect(flag).toBe(false);
  });
});
