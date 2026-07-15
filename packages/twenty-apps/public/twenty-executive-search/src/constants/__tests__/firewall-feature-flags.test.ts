import { describe, expect, it } from 'vitest';

import {
  FIREWALL_AI_CONTEXT_ALLOWLIST_ENABLED,
  FIREWALL_CLIENT_REPORT_SCAN_ENABLED,
  FIREWALL_PIPELINE_EXCLUSION_ENABLED,
  FIREWALL_SEARCH_EXCLUSION_ENABLED,
} from 'src/constants/firewall-feature-flags';

describe('firewall feature flags', () => {
  it('FIREWALL_SEARCH_EXCLUSION_ENABLED is false', () => {
    expect(FIREWALL_SEARCH_EXCLUSION_ENABLED).toBe(false);
  });

  it('FIREWALL_AI_CONTEXT_ALLOWLIST_ENABLED is false', () => {
    expect(FIREWALL_AI_CONTEXT_ALLOWLIST_ENABLED).toBe(false);
  });

  it('FIREWALL_CLIENT_REPORT_SCAN_ENABLED is false', () => {
    expect(FIREWALL_CLIENT_REPORT_SCAN_ENABLED).toBe(false);
  });

  it('FIREWALL_PIPELINE_EXCLUSION_ENABLED is false', () => {
    expect(FIREWALL_PIPELINE_EXCLUSION_ENABLED).toBe(false);
  });
});
