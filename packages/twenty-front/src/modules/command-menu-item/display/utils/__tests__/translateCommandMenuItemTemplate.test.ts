import { translateCommandMenuItemTemplate } from '@/command-menu-item/display/utils/translateCommandMenuItemTemplate';
import { i18n } from '@lingui/core';
import { generateMessageId } from '@lingui/message-utils/generateMessageId';

describe('translateCommandMenuItemTemplate', () => {
  beforeEach(() => {
    i18n.load('pt-BR', {
      [generateMessageId('New {0}')]: ['Novo ', ['0']],
      [generateMessageId('Add to Favorites')]: 'Adicionar aos Favoritos',
    });
    i18n.activate('pt-BR');
  });

  it('should return null or undefined templates unchanged', () => {
    expect(translateCommandMenuItemTemplate(null)).toBeNull();
    expect(translateCommandMenuItemTemplate(undefined)).toBeUndefined();
  });

  it('should translate a template and preserve its ${...} expressions', () => {
    expect(
      translateCommandMenuItemTemplate(
        'New ${capitalize(objectMetadataItem.labelSingular)}',
      ),
    ).toBe('Novo ${capitalize(objectMetadataItem.labelSingular)}');
  });

  it('should translate a plain label without expressions', () => {
    expect(translateCommandMenuItemTemplate('Add to Favorites')).toBe(
      'Adicionar aos Favoritos',
    );
  });

  it('should fall back to the raw template when no catalog entry exists', () => {
    expect(
      translateCommandMenuItemTemplate(
        'My custom command ${objectMetadataItem.labelSingular}',
      ),
    ).toBe('My custom command ${objectMetadataItem.labelSingular}');
  });
});
