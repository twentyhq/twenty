import { describe, expect, it } from 'vitest';

import { getSlackFirstListMarkerIndex } from 'src/logic-functions/utils/get-slack-first-list-marker-index';

describe('getSlackFirstListMarkerIndex', () => {
  it('should find a dash list starting on its own line', () => {
    const responseText = 'Two accounts match:\n- ACME\n- Globex';

    expect(getSlackFirstListMarkerIndex(responseText)).toBe(
      responseText.indexOf('- ACME'),
    );
  });

  it('should find a numbered list', () => {
    const responseText = 'The largest deals:\n1. ACME\n2. Globex';

    expect(getSlackFirstListMarkerIndex(responseText)).toBe(
      responseText.indexOf('1. ACME'),
    );
  });

  it('should find an indented list item', () => {
    const responseText = 'Breakdown:\n  - ACME';

    expect(getSlackFirstListMarkerIndex(responseText)).toBe(
      responseText.indexOf('  - ACME'),
    );
  });

  it('should return nothing for prose that only contains a dash mid-sentence', () => {
    expect(
      getSlackFirstListMarkerIndex('ACME - the largest account - is in Paris.'),
    ).toBeUndefined();
  });

  it('should return nothing when there is no list at all', () => {
    expect(getSlackFirstListMarkerIndex('Created ACME.')).toBeUndefined();
  });
});
