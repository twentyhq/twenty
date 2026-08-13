const SLACK_URL_HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
};

// Slack HTML-escapes URLs in link_shared payloads; a single pass keeps
// pre-escaped sequences like &amp;lt; from being unescaped twice
export const decodeSlackLinkUrl = (url: string): string =>
  url.replace(/&(?:amp|lt|gt);/g, (entity) => SLACK_URL_HTML_ENTITIES[entity]);
