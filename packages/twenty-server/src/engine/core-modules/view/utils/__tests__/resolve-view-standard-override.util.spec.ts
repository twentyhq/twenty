import { i18n } from '@lingui/core';

import { resolveViewStandardOverride } from 'src/engine/core-modules/view/utils/resolve-view-standard-override.util';

jest.mock('@lingui/core', () => ({
  i18n: {
    _: jest.fn(),
  },
}));

jest.mock('src/engine/core-modules/i18n/utils/generateMessageId', () => ({
  generateMessageId: jest.fn((text) => `message_${text}`),
}));

describe('resolveViewStandardOverride', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when view is custom', () => {
    it('should return the direct field value for name', () => {
      const view = {
        name: 'Custom View',
        isCustom: true,
        standardOverrides: null,
      };

      const result = resolveViewStandardOverride(view, 'name', 'fr-FR');

      expect(result).toBe('Custom View');
      expect(i18n._).not.toHaveBeenCalled();
    });
  });

  describe('when view is standard', () => {
    describe('name field with translations', () => {
      it('should return translated value for the specific locale', () => {
        const view = {
          name: 'All Companies',
          isCustom: false,
          standardOverrides: {
            translations: {
              'fr-FR': {
                name: 'Toutes les entreprises',
              },
              'es-ES': {
                name: 'Todas las empresas',
              },
            },
          },
        };

        const result = resolveViewStandardOverride(view, 'name', 'fr-FR');

        expect(result).toBe('Toutes les entreprises');
        expect(i18n._).not.toHaveBeenCalled();
      });

      it('should fallback to source locale override when translation not found', () => {
        const view = {
          name: 'All Companies',
          isCustom: false,
          standardOverrides: {
            name: 'All Companies Override',
            translations: {
              'fr-FR': {
                name: 'Toutes les entreprises',
              },
            },
          },
        };

        const result = resolveViewStandardOverride(view, 'name', 'en');

        expect(result).toBe('All Companies Override');
        expect(i18n._).not.toHaveBeenCalled();
      });

      it('should use Lingui translation when no overrides exist', () => {
        const view = {
          name: 'All Companies',
          isCustom: false,
          standardOverrides: null,
        };

        (i18n._ as jest.Mock).mockReturnValue('Toutes les entreprises');

        const result = resolveViewStandardOverride(view, 'name', 'fr-FR');

        expect(result).toBe('Toutes les entreprises');
        expect(i18n._).toHaveBeenCalledWith('message_All Companies');
      });

      it('should return original value when Lingui returns message ID', () => {
        const view = {
          name: 'All Companies',
          isCustom: false,
          standardOverrides: null,
        };

        (i18n._ as jest.Mock).mockReturnValue('message_All Companies');

        const result = resolveViewStandardOverride(view, 'name', 'fr-FR');

        expect(result).toBe('All Companies');
        expect(i18n._).toHaveBeenCalledWith('message_All Companies');
      });
    });

    describe('edge cases', () => {
      it('should handle undefined locale', () => {
        const view = {
          name: 'All Companies',
          isCustom: false,
          standardOverrides: {
            name: 'Default Override',
          },
        };

        const result = resolveViewStandardOverride(view, 'name', undefined);

        expect(result).toBe('Default Override');
      });

      it('should handle empty string values', () => {
        const view = {
          name: '',
          isCustom: false,
          standardOverrides: null,
        };

        (i18n._ as jest.Mock).mockReturnValue('message_');

        const result = resolveViewStandardOverride(view, 'name', 'fr-FR');

        expect(result).toBe('');
      });

      it('should handle null standardOverrides', () => {
        const view = {
          name: 'All Companies',
          isCustom: false,
          standardOverrides: null,
        };

        (i18n._ as jest.Mock).mockReturnValue('message_All Companies');

        const result = resolveViewStandardOverride(view, 'name', 'fr-FR');

        expect(result).toBe('All Companies');
      });

      it('should handle standardOverrides with empty translations', () => {
        const view = {
          name: 'All Companies',
          isCustom: false,
          standardOverrides: {
            translations: {},
          },
        };

        (i18n._ as jest.Mock).mockReturnValue('message_All Companies');

        const result = resolveViewStandardOverride(view, 'name', 'fr-FR');

        expect(result).toBe('All Companies');
      });
    });
  });
});
