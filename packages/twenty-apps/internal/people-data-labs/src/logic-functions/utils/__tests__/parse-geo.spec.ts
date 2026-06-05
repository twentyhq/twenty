import { describe, expect, it } from 'vitest';

import { parseGeo } from 'src/logic-functions/utils/parse-geo';

describe('parseGeo', () => {
  it('parses a "lat,lng" string', () => {
    expect(parseGeo('37.77,-122.41')).toEqual({ lat: 37.77, lng: -122.41 });
  });

  it('returns nulls for missing or malformed input', () => {
    expect(parseGeo(undefined)).toEqual({ lat: null, lng: null });
    expect(parseGeo('not-a-geo')).toEqual({ lat: null, lng: null });
  });
});
