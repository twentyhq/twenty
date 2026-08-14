import { parseMediaQuery } from '../parseMediaQuery';

describe('parseMediaQuery', () => {
  it('should parse an empty query as matching everything', () => {
    expect(parseMediaQuery('')).toEqual({
      isNegated: false,
      matchesMediaType: true,
      conditions: [],
    });
  });

  it('should parse a min-width condition in pixels', () => {
    expect(parseMediaQuery('(min-width: 600px)')).toEqual({
      isNegated: false,
      matchesMediaType: true,
      conditions: [
        {
          kind: 'numeric',
          source: 'viewportWidth',
          comparison: 'min',
          value: 600,
        },
      ],
    });
  });

  it('should convert em and rem lengths to pixels', () => {
    expect(parseMediaQuery('(max-width: 40em)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'viewportWidth',
        comparison: 'max',
        value: 640,
      },
    ]);
    expect(parseMediaQuery('(min-height: 10rem)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'viewportHeight',
        comparison: 'min',
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
          source: 'viewportWidth',
          comparison: 'min',
          value: 600,
        },
        {
          kind: 'numeric',
          source: 'viewportWidth',
          comparison: 'max',
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
        comparison: 'min',
        value: 2,
      },
    ]);
    expect(parseMediaQuery('(min-resolution: 192dpi)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'devicePixelRatio',
        comparison: 'min',
        value: 2,
      },
    ]);
    expect(parseMediaQuery('(max-resolution: 1.5dppx)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'devicePixelRatio',
        comparison: 'max',
        value: 1.5,
      },
    ]);
  });

  it('should parse prefers-color-scheme values', () => {
    expect(parseMediaQuery('(prefers-color-scheme: dark)')?.conditions).toEqual(
      [{ kind: 'color-scheme', value: 'dark' }],
    );
  });

  it('should reject unknown features, malformed queries, and unitless lengths', () => {
    expect(parseMediaQuery('(orientation: portrait)')).toBeNull();
    expect(parseMediaQuery('(min-width: 600)')).toBeNull();
    expect(parseMediaQuery('(min-width >= 600px)')).toBeNull();
    expect(parseMediaQuery('(min-width: 600vw)')).toBeNull();
    expect(parseMediaQuery('garbage')).toBeNull();
    expect(parseMediaQuery('not')).toBeNull();
    expect(parseMediaQuery('(prefers-color-scheme: solarized)')).toBeNull();
    expect(parseMediaQuery('(min-width: 600px) and screen')).toBeNull();
  });

  it('should reject only when it is not followed by a media type', () => {
    expect(parseMediaQuery('only (min-width: 600px)')).toBeNull();
  });

  it('should reject webkit-prefixed features other than device pixel ratio', () => {
    expect(parseMediaQuery('(-webkit-min-width: 600px)')).toBeNull();
  });

  it('should parse values with a leading decimal point', () => {
    expect(
      parseMediaQuery('(-webkit-min-device-pixel-ratio: .5)')?.conditions,
    ).toEqual([
      {
        kind: 'numeric',
        source: 'devicePixelRatio',
        comparison: 'min',
        value: 0.5,
      },
    ]);
    expect(parseMediaQuery('(min-width: .5em)')?.conditions).toEqual([
      { kind: 'numeric', source: 'viewportWidth', comparison: 'min', value: 8 },
    ]);
    expect(parseMediaQuery('(min-resolution: .5dppx)')?.conditions).toEqual([
      {
        kind: 'numeric',
        source: 'devicePixelRatio',
        comparison: 'min',
        value: 0.5,
      },
    ]);
  });

  it('should accept a zero length without a unit', () => {
    expect(parseMediaQuery('(min-width: 0)')?.conditions).toEqual([
      { kind: 'numeric', source: 'viewportWidth', comparison: 'min', value: 0 },
    ]);
  });
});
