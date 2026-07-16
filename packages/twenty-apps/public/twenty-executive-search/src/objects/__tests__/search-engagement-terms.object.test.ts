import { describe, expect, it } from 'vitest';

import {
  ENGAGEMENT_TYPE_RETAINED,
  STATUS_DRAFT,
} from 'src/constants/universal-identifiers';

// Import the module once and reuse across tests
import modDefault from 'src/objects/search-engagement-terms.object';

describe('searchEngagementTerms object', () => {
  it('validates without errors', () => {
    const result = modDefault;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.nameSingular).toBe('searchEngagementTerms');
    expect(result.config.fields.length).toBe(16);
  });

  it('has engagementType SELECT with RETAINED default', () => {
    const engagementTypeField = modDefault.config.fields.find(
      (f: { name: string }) => f.name === 'engagementType',
    );
    expect(engagementTypeField).toBeDefined();
    expect(engagementTypeField!.options).toBeDefined();
    expect(engagementTypeField!.options!.length).toBe(3);
    expect(engagementTypeField!.defaultValue).toBe(`'${ENGAGEMENT_TYPE_RETAINED}'`);
  });

  it('has status SELECT with DRAFT default and 5 options', () => {
    const statusField = modDefault.config.fields.find(
      (f: { name: string }) => f.name === 'status',
    );
    expect(statusField).toBeDefined();
    expect(statusField!.options).toBeDefined();
    expect(statusField!.options!.length).toBe(5);
    expect(statusField!.defaultValue).toBe(`'${STATUS_DRAFT}'`);
  });
});
