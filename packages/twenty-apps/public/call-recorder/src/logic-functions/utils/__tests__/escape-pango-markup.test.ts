import { describe, expect, it } from 'vitest';

import { escapePangoMarkup } from 'src/logic-functions/utils/escape-pango-markup.util';

describe('escapePangoMarkup', () => {
  it('escapes characters that would break the markup', () => {
    expect(escapePangoMarkup(`R&D <b>"Ops"</b> 'Team'`)).toBe(
      'R&amp;D &lt;b&gt;&quot;Ops&quot;&lt;/b&gt; &#39;Team&#39;',
    );
  });
});
