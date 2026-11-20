import { describe, expect, it } from 'vitest';
import { formatLocationText } from 'src/logic-functions/data/format-location-text.util';

describe('formatLocationText', () => {
  it('should format the location as plain text without markup', () => {
    expect(
      formatLocationText({
        name: 'Office',
        latitude: 52.23,
        longitude: 21.01,
        url: "https://example.com/'><script>",
      }),
    ).toBe("Office\n52.23, 21.01\nhttps://example.com/'><script>");
  });
});
