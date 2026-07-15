import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  FIREWALL_ENFORCEMENT_CONTEXTS,
  FIREWALL_PROHIBITED_ENTRIES,
  FIREWALL_PROHIBITED_SELECTORS,
  getProhibitedSelectorsForContext,
  isSelectorProhibitedInContext,
  type FirewallEnforcementContext,
  type FirewallProhibitedEntry,
  type FirewallProhibitedSelector,
  type FirewallProhibitedStatus,
} from 'src/firewall/firewall-registry';

describe('FIREWALL_PROHIBITED_ENTRIES', () => {
  it('has exactly 30 entries', () => {
    expect(FIREWALL_PROHIBITED_ENTRIES.length).toBe(30);
  });

  it('every entry has status PROHIBITED', () => {
    for (const entry of FIREWALL_PROHIBITED_ENTRIES) {
      expect(entry.status).toBe('PROHIBITED');
    }
  });

  it('has no duplicate (selector, context) pairs', () => {
    const seen = new Set<string>();
    for (const entry of FIREWALL_PROHIBITED_ENTRIES) {
      const key = `${entry.selector}:${entry.context}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('matches CSV data exactly', () => {
    // CSV is 7 levels up from this test file
    // src/firewall/__tests__/ -> src/firewall/ -> src/ -> twenty-executive-search/ -> public/ -> twenty-apps/ -> packages/ -> repo root
    const csvPath = resolve(
      __dirname,
      '../../../../../../../docs/executive-search/commercial-selection-firewall.csv',
    );
    const csvContent = readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');

    // Skip header line
    const dataLines = lines.slice(1);

    expect(dataLines.length).toBe(30);

    const csvEntries: FirewallProhibitedEntry[] = dataLines.map((line) => {
      const parts = line.split(',');
      return {
        selector: parts[0] as FirewallProhibitedSelector,
        context: parts[1] as FirewallEnforcementContext,
        status: parts[2] as FirewallProhibitedStatus,
        rule: parts.slice(3).join(','), // handle rules with commas
      };
    });

    for (let i = 0; i < FIREWALL_PROHIBITED_ENTRIES.length; i++) {
      expect(FIREWALL_PROHIBITED_ENTRIES[i].selector).toBe(
        csvEntries[i].selector,
      );
      expect(FIREWALL_PROHIBITED_ENTRIES[i].context).toBe(
        csvEntries[i].context,
      );
      expect(FIREWALL_PROHIBITED_ENTRIES[i].status).toBe(
        csvEntries[i].status,
      );
      expect(FIREWALL_PROHIBITED_ENTRIES[i].rule).toBe(csvEntries[i].rule);
    }
  });
});

describe('FIREWALL_PROHIBITED_SELECTORS', () => {
  it('has exactly 20 selectors', () => {
    expect(FIREWALL_PROHIBITED_SELECTORS.length).toBe(20);
  });

  it('contains all unique selectors from prohibited entries', () => {
    const uniqueSelectors = new Set(
      FIREWALL_PROHIBITED_ENTRIES.map((entry) => entry.selector),
    );
    expect(uniqueSelectors.size).toBe(20);
    for (const selector of FIREWALL_PROHIBITED_SELECTORS) {
      expect(uniqueSelectors.has(selector)).toBe(true);
    }
  });
});

describe('FIREWALL_ENFORCEMENT_CONTEXTS', () => {
  it('has exactly 6 contexts', () => {
    expect(FIREWALL_ENFORCEMENT_CONTEXTS.length).toBe(6);
  });

  it('contains all unique contexts from prohibited entries', () => {
    const uniqueContexts = new Set(
      FIREWALL_PROHIBITED_ENTRIES.map((entry) => entry.context),
    );
    expect(uniqueContexts.size).toBe(6);
    for (const context of FIREWALL_ENFORCEMENT_CONTEXTS) {
      expect(uniqueContexts.has(context)).toBe(true);
    }
  });
});

describe('isSelectorProhibitedInContext', () => {
  it('returns true for subscription_tier in search_filter context', () => {
    expect(isSelectorProhibitedInContext('subscription_tier', 'search_filter')).toBe(true);
  });

  it('returns false for subscription_tier in selection_context', () => {
    expect(
      isSelectorProhibitedInContext('subscription_tier', 'selection_context'),
    ).toBe(false);
  });

  it('returns true for all prohibited entries', () => {
    for (const entry of FIREWALL_PROHIBITED_ENTRIES) {
      expect(
        isSelectorProhibitedInContext(entry.selector, entry.context),
      ).toBe(true);
    }
  });
});

describe('getProhibitedSelectorsForContext', () => {
  it('returns 16 selectors for search_filter', () => {
    const selectors = getProhibitedSelectorsForContext('search_filter');
    expect(selectors.length).toBe(16);
  });

  it('returns 4 selectors for selection_context', () => {
    const selectors = getProhibitedSelectorsForContext('selection_context');
    expect(selectors.length).toBe(4);
  });

  it('returns 6 selectors for ai_context', () => {
    const selectors = getProhibitedSelectorsForContext('ai_context');
    expect(selectors.length).toBe(6);
  });

  it('returns 2 selectors for client_report', () => {
    const selectors = getProhibitedSelectorsForContext('client_report');
    expect(selectors.length).toBe(2);
  });

  it('returns 1 selector for slate_presentation', () => {
    const selectors = getProhibitedSelectorsForContext('slate_presentation');
    expect(selectors.length).toBe(1);
  });

  it('returns 1 selector for pipeline_automation', () => {
    const selectors = getProhibitedSelectorsForContext('pipeline_automation');
    expect(selectors.length).toBe(1);
  });
});
