import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { describe, expect, it } from 'vitest';

import { createMetadataOwnerResolver } from '@/metadata/resolve-metadata-owner';

const resolveOwner = createMetadataOwnerResolver({
  applications: [
    {
      id: 'standard-id',
      name: 'Twenty Standard',
      universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    },
    {
      id: 'invoices-id',
      name: 'Acme Invoices',
      universalIdentifier: 'invoices-universal-identifier',
    },
  ],
  workspaceCustomApplicationId: 'custom-id',
});

describe('createMetadataOwnerResolver', () => {
  it('recognizes the standard application', () => {
    expect(resolveOwner('standard-id')).toEqual({
      kind: 'standard',
      applicationId: 'standard-id',
      name: null,
    });
  });

  it('recognizes the workspace custom application even when it is not listed', () => {
    expect(resolveOwner('custom-id').kind).toBe('custom');
  });

  it('names an installed app', () => {
    expect(resolveOwner('invoices-id')).toEqual({
      kind: 'application',
      applicationId: 'invoices-id',
      name: 'Acme Invoices',
    });
  });

  it('keeps an owner it cannot see as unknown', () => {
    expect(resolveOwner('hidden-id')).toEqual({
      kind: 'unknown',
      applicationId: 'hidden-id',
      name: null,
    });
  });
});
