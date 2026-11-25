import { describe, expect, it } from 'vitest';

import { html } from 'src/utils/html.util';

describe('html', () => {
  it('escapes interpolated text', () => {
    expect(
      html`<p title="${'"quoted"'}">${"<script>alert('x')</script>"}</p>`,
    ).toEqual({
      safeHtml:
        '<p title="&quot;quoted&quot;">&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;</p>',
    });
  });

  it('keeps nested markup and drops missing values', () => {
    expect(
      html`<div>${html`<b>${'a & b'}</b>`}${null}${undefined}</div>`,
    ).toEqual({ safeHtml: '<div><b>a &amp; b</b></div>' });
  });
});
