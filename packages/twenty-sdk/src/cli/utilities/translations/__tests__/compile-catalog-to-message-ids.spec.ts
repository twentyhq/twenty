import { describe, expect, it, vi } from 'vitest';

import { generateMessageId } from 'twenty-shared/i18n';

import { compileCatalogToMessageIds } from '@/cli/utilities/translations/compile-catalog-to-message-ids';
import { CONTEXT_SEPARATOR } from '@/sdk/front-component/translations/message/context-separator.constant';
import { getTranslationCatalogKey } from '@/sdk/front-component/translations/message';

describe('compileCatalogToMessageIds', () => {
  it('keys translations by message id, honoring the context', () => {
    const compiled = compileCatalogToMessageIds({
      catalog: {
        Export: 'Exporter',
        [getTranslationCatalogKey('Export', 'view.name')]: 'Export de vue',
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
      },
    });

    expect(compiled).toEqual({ [generateMessageId('Delete')]: 'Supprimer' });
  });

  it('reports a collision and keeps the later entry', () => {
    const onCollision = vi.fn();

    // A context-less key and an empty-context key hash identically, so two
    // distinct catalog keys can claim one message id.
    const compiled = compileCatalogToMessageIds({
      catalog: {
        Export: 'first',
        [`${CONTEXT_SEPARATOR}Export`]: 'second',
      },
      onCollision,
    });

    expect(onCollision).toHaveBeenCalledWith({
      messageId: generateMessageId('Export'),
      keptKey: `${CONTEXT_SEPARATOR}Export`,
      droppedKey: 'Export',
    });
    expect(compiled).toEqual({ [generateMessageId('Export')]: 'second' });
  });
});
