import { collapseViewVisibilityOverrides } from 'src/database/commands/upgrade-version-command/2-58/utils/collapse-view-visibility-overrides.util';

const OWNER_APPLICATION = 'owning-application';

const collapse = (visibility: unknown, overrides: unknown) =>
  collapseViewVisibilityOverrides({
    visibility,
    overrides,
    applicationUniversalIdentifier: OWNER_APPLICATION,
  });

describe('collapseViewVisibilityOverrides', () => {
  it.each(['WORKSPACE', 'UNLISTED'])(
    'preserves %s without overrides',
    (visibility) => {
      expect(collapse(visibility, null)).toEqual({
        visibility,
        overrides: null,
      });
    },
  );

  it('preserves private legacy visibility and unrelated overrides', () => {
    const overrides = { visibility: 'UNLISTED', name: 'Personal', icon: null };

    expect(collapse('WORKSPACE', overrides)).toEqual({
      visibility: 'UNLISTED',
      overrides: { name: 'Personal', icon: null },
    });
    expect(overrides.visibility).toBe('UNLISTED');
  });

  it('preserves an effective shared override over a private base', () => {
    expect(collapse('UNLISTED', { visibility: 'WORKSPACE' })).toEqual({
      visibility: 'WORKSPACE',
      overrides: {},
    });
  });

  it('ranks other authors before the owning application', () => {
    expect(
      collapse('WORKSPACE', {
        [OWNER_APPLICATION]: { visibility: 'WORKSPACE', name: 'Default' },
        custom: { visibility: 'UNLISTED', position: 4 },
      }),
    ).toEqual({
      visibility: 'UNLISTED',
      overrides: {
        [OWNER_APPLICATION]: { name: 'Default' },
        custom: { position: 4 },
      },
    });
  });

  it('keeps persisted non-owner author order', () => {
    expect(
      collapse('WORKSPACE', {
        first: { visibility: 'UNLISTED' },
        second: { visibility: 'WORKSPACE' },
      }).visibility,
    ).toBe('UNLISTED');
  });

  it('falls through missing visibility to the owning application', () => {
    expect(
      collapse('WORKSPACE', {
        custom: { name: 'Custom' },
        [OWNER_APPLICATION]: { visibility: 'UNLISTED' },
      }).visibility,
    ).toBe('UNLISTED');
  });

  it.each(['translations', 'calendarFieldMetadataUniversalIdentifier'])(
    'recognizes legacy overrides by %s even without a visibility override',
    (property) => {
      expect(
        collapse('UNLISTED', {
          [property]: null,
          custom: { visibility: 'WORKSPACE', icon: 'IconTable' },
        }),
      ).toEqual({
        visibility: 'UNLISTED',
        overrides: { [property]: null, custom: { icon: 'IconTable' } },
      });
    },
  );

  it('removes hidden authored visibility before legacy detection can change', () => {
    const result = collapse('WORKSPACE', {
      visibility: 'UNLISTED',
      custom: { visibility: 'WORKSPACE', name: 'Custom' },
    });

    expect(result).toEqual({
      visibility: 'UNLISTED',
      overrides: { custom: { name: 'Custom' } },
    });
    expect(collapse(result.visibility, result.overrides)).toEqual(result);
  });

  it('preserves unrelated nested values, empty authors and absent entries', () => {
    const overrides = {
      custom: {
        visibility: 'UNLISTED',
        translations: { fr: { name: 'Personnel' } },
      },
      empty: {},
      absent: null,
    };

    expect(collapse('WORKSPACE', overrides)).toEqual({
      visibility: 'UNLISTED',
      overrides: {
        custom: { translations: { fr: { name: 'Personnel' } } },
        empty: {},
        absent: null,
      },
    });
    expect(overrides.custom.visibility).toBe('UNLISTED');
  });

  it.each([null, 'PRIVATE', false])(
    'rejects invalid effective visibility %s',
    (visibility) => {
      expect(() =>
        collapse('WORKSPACE', {
          custom: { visibility },
          [OWNER_APPLICATION]: { visibility: 'WORKSPACE' },
        }),
      ).toThrow('Invalid stored view visibility');
    },
  );

  it.each([[], 'invalid', 42])(
    'rejects malformed stored overrides %s',
    (overrides) => {
      expect(() => collapse('WORKSPACE', overrides)).toThrow(
        'Invalid stored view overrides',
      );
    },
  );
});
