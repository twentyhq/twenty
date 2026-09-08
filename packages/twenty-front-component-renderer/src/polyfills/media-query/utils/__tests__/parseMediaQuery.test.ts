import { parseMediaQuery } from '../parseMediaQuery';

describe('parseMediaQuery', () => {
  it('should reject an empty query, which only a whole query list may be', () => {
    expect(parseMediaQuery('')).toBeNull();
    expect(parseMediaQuery('   ')).toBeNull();
  });

  it('should parse a min-width condition in pixels', () => {
    expect(parseMediaQuery('(min-width: 600px)')).toEqual({
      isNegated: false,
      matchesMediaType: true,
      conditions: [
        {
          kind: 'numeric',
          source: 'componentWidth',
          operator: '>=',
          value: 600,
        },
      ],
    });
  });

  it('should convert em and rem lengths to pixels', () => {
    expect(parseMediaQuery('(max-width: 40em)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'componentWidth',
        operator: '<=',
        value: 640,
      },
    ]);
    expect(parseMediaQuery('(min-height: 10rem)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'componentHeight',
        operator: '>=',
        value: 160,
      },
    ]);
  });

  it('should parse a media type combined with conditions', () => {
    expect(
      parseMediaQuery('screen and (min-width: 600px) and (max-width: 900px)'),
    ).toEqual({
      isNegated: false,
      matchesMediaType: true,
      conditions: [
        {
          kind: 'numeric',
          source: 'componentWidth',
          operator: '>=',
          value: 600,
        },
        {
          kind: 'numeric',
          source: 'componentWidth',
          operator: '<=',
          value: 900,
        },
      ],
    });
  });

  it('should parse not and only prefixes', () => {
    expect(parseMediaQuery('not print')).toEqual({
      isNegated: true,
      matchesMediaType: false,
      conditions: [],
    });
    expect(parseMediaQuery('only screen and (min-width: 0px)')?.isNegated).toBe(
      false,
    );
  });

  it('should parse device pixel ratio and resolution features', () => {
    expect(
      parseMediaQuery('(-webkit-min-device-pixel-ratio: 2)')?.conditions,
    ).toEqual([
      {
        kind: 'numeric',
        source: 'devicePixelRatio',
        operator: '>=',
        value: 2,
      },
    ]);
    expect(parseMediaQuery('(min-resolution: 192dpi)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'devicePixelRatio',
        operator: '>=',
        value: 2,
      },
    ]);
    expect(parseMediaQuery('(max-resolution: 1.5dppx)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'devicePixelRatio',
        operator: '<=',
        value: 1.5,
      },
    ]);
  });

  it('should parse orientation values', () => {
    expect(parseMediaQuery('(orientation: portrait)')?.conditions).toEqual([
      { kind: 'keyword', featureName: 'orientation', value: 'portrait' },
    ]);
    expect(parseMediaQuery('(orientation: landscape)')?.conditions).toEqual([
      { kind: 'keyword', featureName: 'orientation', value: 'landscape' },
    ]);
    expect(parseMediaQuery('(orientation: sideways)')).toBeNull();
  });

  it('should parse prefers-color-scheme values', () => {
    expect(parseMediaQuery('(prefers-color-scheme: dark)')?.conditions).toEqual(
      [{ kind: 'keyword', featureName: 'prefers-color-scheme', value: 'dark' }],
    );
  });

  it('should reject unknown features, malformed queries, and unitless lengths', () => {
    expect(parseMediaQuery('(min-width: 600)')).toBeNull();
    expect(parseMediaQuery('(min-width >= 600px)')).toBeNull();
    expect(parseMediaQuery('(min-width: 600vw)')).toBeNull();
    expect(parseMediaQuery('(constructor: 1)')).toBeNull();
    expect(parseMediaQuery('(__proto__: 1)')).toBeNull();
    expect(parseMediaQuery('(min-width: 600constructor)')).toBeNull();
    expect(parseMediaQuery('(resolution: 2constructor)')).toBeNull();
    expect(parseMediaQuery('not')).toBeNull();
    expect(parseMediaQuery('(prefers-color-scheme: solarized)')).toBeNull();
    expect(parseMediaQuery('(prefers-color-scheme: no-preference)')).toBeNull();
    expect(parseMediaQuery('(min-width: 600px) and screen')).toBeNull();
  });

  it('should reject only when it is not followed by a media type', () => {
    expect(parseMediaQuery('only (min-width: 600px)')).toBeNull();
  });

  it('should accept not when it is not followed by a media type', () => {
    expect(parseMediaQuery('not (min-width: 600px)')).toEqual({
      isNegated: true,
      matchesMediaType: true,
      conditions: [
        {
          kind: 'numeric',
          source: 'componentWidth',
          operator: '>=',
          value: 600,
        },
      ],
    });
  });

  it('should reject not applied to a condition followed by and clauses', () => {
    expect(
      parseMediaQuery('not (min-width: 600px) and (max-width: 900px)'),
    ).toBeNull();
    expect(parseMediaQuery('not screen and (min-width: 600px)')).toEqual({
      isNegated: true,
      matchesMediaType: true,
      conditions: [
        {
          kind: 'numeric',
          source: 'componentWidth',
          operator: '>=',
          value: 600,
        },
      ],
    });
  });

  it('should reject webkit-prefixed features other than device pixel ratio', () => {
    expect(parseMediaQuery('(-webkit-min-width: 600px)')).toBeNull();
  });

  it('should parse values with a leading decimal point', () => {
    expect(parseMediaQuery('(min-width: .5em)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'componentWidth',
        operator: '>=',
        value: 8,
      },
    ]);
  });

  it('should accept a zero length without a unit', () => {
    expect(parseMediaQuery('(min-width: 0)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'componentWidth',
        operator: '>=',
        value: 0,
      },
    ]);
  });

  it('should accept CSS whitespace inside conditions and after modifiers', () => {
    expect(parseMediaQuery('(min-width:\n600px)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'componentWidth',
        operator: '>=',
        value: 600,
      },
    ]);
    expect(parseMediaQuery('not\tprint')).toEqual({
      isNegated: true,
      matchesMediaType: false,
      conditions: [],
    });
    expect(
      parseMediaQuery('only\nscreen and (min-width: 0)')?.matchesMediaType,
    ).toBe(true);
    expect(
      parseMediaQuery('(min-width: 600px)and (max-width: 900px)')?.conditions,
    ).toHaveLength(2);
  });

  it('should reject whitespace that CSS does not recognize', () => {
    expect(parseMediaQuery('screen and\u00a0(min-width: 1px)')).toBeNull();
    expect(
      parseMediaQuery('(min-width: 600px)and(max-width: 900px)'),
    ).toBeNull();
    expect(parseMediaQuery('not(min-width: 1px)')).toBeNull();
  });

  it('should treat an unknown media type as valid but never matching', () => {
    expect(parseMediaQuery('garbage')).toEqual({
      isNegated: false,
      matchesMediaType: false,
      conditions: [],
    });
    expect(parseMediaQuery('not tablet')).toEqual({
      isNegated: true,
      matchesMediaType: false,
      conditions: [],
    });
    expect(parseMediaQuery('12px')).toBeNull();
    expect(parseMediaQuery('not and')).toBeNull();
    expect(parseMediaQuery('not not')).toBeNull();
  });

  it('should parse range syntax with the feature on either side', () => {
    expect(parseMediaQuery('(width >= 600px)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'componentWidth',
        operator: '>=',
        value: 600,
      },
    ]);
    expect(parseMediaQuery('(600px <= width)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'componentWidth',
        operator: '>=',
        value: 600,
      },
    ]);
    expect(parseMediaQuery('(width = 600px)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'componentWidth',
        operator: '=',
        value: 600,
      },
    ]);
    expect(parseMediaQuery('(400px <= width <= 800px)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'componentWidth',
        operator: '>=',
        value: 400,
      },
      {
        kind: 'numeric',
        source: 'componentWidth',
        operator: '<=',
        value: 800,
      },
    ]);
    expect(parseMediaQuery('(800px >= height > 400px)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'componentHeight',
        operator: '<=',
        value: 800,
      },
      {
        kind: 'numeric',
        source: 'componentHeight',
        operator: '>',
        value: 400,
      },
    ]);
  });

  it('should reject malformed range syntax', () => {
    expect(parseMediaQuery('(400px <= width >= 800px)')).toBeNull();
    expect(parseMediaQuery('(width >= 400px <= 800px)')).toBeNull();
    expect(parseMediaQuery('(400px = width <= 800px)')).toBeNull();
    expect(parseMediaQuery('(orientation >= portrait)')).toBeNull();
    expect(parseMediaQuery('(width >= 600)')).toBeNull();
    expect(parseMediaQuery('(-webkit-min-device-pixel-ratio >= 2)')).toBeNull();
  });

  it('should parse features in boolean context', () => {
    expect(parseMediaQuery('(width)')?.conditions).toEqual([
      { kind: 'non-zero', source: 'componentWidth' },
    ]);
    expect(parseMediaQuery('(orientation)')?.conditions).toEqual([]);
    expect(parseMediaQuery('(prefers-color-scheme)')?.conditions).toEqual([]);
    expect(parseMediaQuery('(-webkit-device-pixel-ratio)')?.conditions).toEqual(
      [{ kind: 'non-zero', source: 'devicePixelRatio' }],
    );
    expect(parseMediaQuery('(min-width)')).toBeNull();
    expect(parseMediaQuery('(hover)')).toBeNull();
  });

  it('should reject non-CSS whitespace anywhere in a condition', () => {
    expect(parseMediaQuery('(\u00a0width >= 600px)')).toBeNull();
    expect(parseMediaQuery('(min-width:\u00a0600px)')).toBeNull();
    expect(parseMediaQuery('(min-width: 600px\u00a0)')).toBeNull();
    expect(parseMediaQuery('\u00a0screen')).toBeNull();
  });
});
