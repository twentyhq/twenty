import { describe, expect, it } from 'vitest';

import { extractCaptionText } from './extract-caption-text.util';
import { extractOpenGraph } from './extract-open-graph.util';
import { extractPageText } from './extract-page-text.util';
import { extractYoutubeCaptionTrackUrl } from './extract-youtube-caption-track-url.util';

describe('extractPageText', () => {
  it('strips scripts, styles and tags and collapses whitespace', () => {
    const html = `
      <html><head><style>body{color:red}</style>
      <script>console.log('x')</script></head>
      <body><h1>Acme</h1>   <p>We   built a <b>Twenty</b> CRM.</p></body></html>`;

    expect(extractPageText(html)).toBe('Acme We built a Twenty CRM.');
  });

  it('decodes the common named and numeric entities', () => {
    expect(extractPageText('<p>Tom &amp; Jerry &#39;s &lt;CRM&gt;</p>')).toBe(
      "Tom & Jerry 's <CRM>",
    );
  });

  it('caps the excerpt at the requested length', () => {
    expect(extractPageText(`<p>${'a'.repeat(50)}</p>`, 10)).toBe('a'.repeat(10));
  });

  it('returns null for missing or empty html', () => {
    expect(extractPageText(null)).toBeNull();
    expect(extractPageText('<script>only()</script>')).toBeNull();
  });
});

describe('extractOpenGraph', () => {
  it('reads title, description and image in either attribute order', () => {
    const html = `
      <meta property="og:title" content="Twenty migration walkthrough" />
      <meta content="A 6 minute tour of the workspace" property="og:description">
      <meta property="og:image" content="https://cdn.test/thumb.jpg">`;

    expect(extractOpenGraph(html)).toEqual({
      title: 'Twenty migration walkthrough',
      description: 'A 6 minute tour of the workspace',
      imageUrl: 'https://cdn.test/thumb.jpg',
    });
  });

  it('falls back to the <title> tag when og:title is absent', () => {
    expect(extractOpenGraph('<title>Loom | Acme demo</title>').title).toBe(
      'Loom | Acme demo',
    );
  });

  it('returns nulls for missing html', () => {
    expect(extractOpenGraph(null)).toEqual({
      title: null,
      description: null,
      imageUrl: null,
    });
  });
});

describe('extractYoutubeCaptionTrackUrl', () => {
  it('reads the first caption track baseUrl and unescapes it', () => {
    const html =
      '{"captionTracks":[{"baseUrl":"https://www.youtube.com/api/timedtext?v=abc\\u0026lang=en","languageCode":"en"}]}';

    expect(extractYoutubeCaptionTrackUrl(html)).toBe(
      'https://www.youtube.com/api/timedtext?v=abc&lang=en',
    );
  });

  it('returns null when the watch page carries no caption track', () => {
    expect(extractYoutubeCaptionTrackUrl('<html>no captions</html>')).toBeNull();
    expect(extractYoutubeCaptionTrackUrl(null)).toBeNull();
  });
});

describe('extractCaptionText', () => {
  it('joins timedtext cues into one decoded line', () => {
    const xml =
      '<transcript><text start="0" dur="2">We migrated Acme&amp;#39;s CRM</text>' +
      '<text start="2" dur="2">to Twenty in three weeks</text></transcript>';

    expect(extractCaptionText(xml)).toBe(
      "We migrated Acme's CRM to Twenty in three weeks",
    );
  });

  it('caps the transcript at the requested length', () => {
    const xml = `<transcript><text>${'b'.repeat(50)}</text></transcript>`;

    expect(extractCaptionText(xml, 10)).toBe('b'.repeat(10));
  });
});
