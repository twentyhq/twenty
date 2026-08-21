import { describe, expect, it, vi } from 'vitest';

import { generateMessageId } from 'twenty-shared/i18n';

import { compileCatalogToMessageIds } from '@/cli/utilities/translations/compile-catalog-to-message-ids';

describe('compileCatalogToMessageIds', () => {
  it('keys translations by message id, honoring context groups', () => {
    const compiled = compileCatalogToMessageIds({
      catalog: {
        Export: 'Exporter',
        'view.name': { Export: 'Export de vue' },
      },
    });

    expect(compiled).toEqual({
      [generateMessageId('Export')]: 'Exporter',
      [generateMessageId('Export', 'view.name')]: 'Export de vue',
    });
  });

  it('skips empty and non-string translations', () => {
    const compiled = compileCatalogToMessageIds({
      catalog: {
        Export: '',
        Import: 42,
        Delete: 'Supprimer',
        'view.name': { Untranslated: '' },
      },
    });

    expect(compiled).toEqual({ [generateMessageId('Delete')]: 'Supprimer' });
  });

  it('reports a collision and keeps the later entry', () => {
    const onCollision = vi.fn();

    // An empty-string context group hashes like no context at all, so two
    // distinct authored entries can claim one message id.
    const compiled = compileCatalogToMessageIds({
      catalog: {
        Export: 'first',
        '': { Export: 'second' },
      },
      onCollision,
    });

    expect(onCollision).toHaveBeenCalledWith({
      messageId: generateMessageId('Export'),
      keptKey: ' Export',
      droppedKey: 'Export',
    });
    expect(compiled).toEqual({ [generateMessageId('Export')]: 'second' });
  });
});
