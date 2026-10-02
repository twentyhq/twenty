import { looksLikeHtml } from 'src/engine/core-modules/email/utils/looks-like-html.util';

describe('looksLikeHtml', () => {
  it('should return true for standard HTML tags and fragments', () => {
    expect(looksLikeHtml('<p>Hello</p>')).toBe(true);
    expect(looksLikeHtml('<p>Hi')).toBe(true);
    expect(looksLikeHtml('<div>Content</div>')).toBe(true);
    expect(looksLikeHtml('<center>Hi</center>')).toBe(true);
    expect(looksLikeHtml('Hello <strong>Ada</strong>')).toBe(true);
    expect(looksLikeHtml('</p>')).toBe(true);
  });

  it('should return true for HTML tags with attributes', () => {
    expect(looksLikeHtml('<p class="lead">Hello</p>')).toBe(true);
    expect(looksLikeHtml('<a href="https://example.com">Click</a>')).toBe(true);
    expect(looksLikeHtml('<img src="https://example.com/logo.png" />')).toBe(
      true,
    );
    expect(looksLikeHtml('<br class="x">')).toBe(true);
  });

  it('should return true for void and doctype tags', () => {
    expect(looksLikeHtml('<br>')).toBe(true);
    expect(looksLikeHtml('<br/>')).toBe(true);
    expect(looksLikeHtml('<br />')).toBe(true);
    expect(looksLikeHtml('<hr>')).toBe(true);
    expect(looksLikeHtml('<!DOCTYPE html><html>')).toBe(true);
  });

  it('should return false for plain text strings', () => {
    expect(looksLikeHtml('Hello world')).toBe(false);
    expect(looksLikeHtml('Dear Nick,\n\nFirst para.\n\nThanks,\nNick')).toBe(
      false,
    );
    expect(looksLikeHtml('Hello <name>\nThanks')).toBe(false);
    expect(looksLikeHtml('R&D department')).toBe(false);
    expect(looksLikeHtml('Copy &amp; paste\n\nThanks')).toBe(false);
  });

  it('should return false for text with mathematical comparisons (<, >)', () => {
    expect(looksLikeHtml('Price < 5 & > 2\n\nok')).toBe(false);
    expect(looksLikeHtml('a < b and c > d')).toBe(false);
    expect(looksLikeHtml('a < b > c')).toBe(false);
  });

  it('should return false for RFC 5322 email addresses in angle brackets', () => {
    expect(looksLikeHtml('Contact John <john@company.com>')).toBe(false);
    expect(
      looksLikeHtml('From: Jane Doe <jane.doe@example.org>\n\nPlease reply.'),
    ).toBe(false);
  });

  it('should return false for empty or whitespace strings', () => {
    expect(looksLikeHtml('')).toBe(false);
    expect(looksLikeHtml('   ')).toBe(false);
  });
});
