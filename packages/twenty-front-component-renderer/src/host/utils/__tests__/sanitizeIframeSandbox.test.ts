import { sanitizeIframeSandbox } from '../sanitizeIframeSandbox';

const toTokenSet = (sandbox: string): Set<string> =>
  new Set(sandbox.split(/\s+/).filter(Boolean));

describe('sanitizeIframeSandbox', () => {
  it('should apply a safe default when no sandbox is provided', () => {
    const tokens = toTokenSet(sanitizeIframeSandbox(undefined));

    expect(tokens.has('allow-scripts')).toBe(true);
    expect(tokens.has('allow-forms')).toBe(true);
    expect(tokens.has('allow-popups')).toBe(true);
    expect(tokens.has('allow-same-origin')).toBe(false);
  });

  it('should keep allow-scripts so embedded content stays functional', () => {
    const tokens = toTokenSet(sanitizeIframeSandbox('allow-forms'));

    expect(tokens.has('allow-scripts')).toBe(true);
    expect(tokens.has('allow-forms')).toBe(true);
  });

  it('should strip allow-same-origin while keeping allow-scripts', () => {
    const tokens = toTokenSet(
      sanitizeIframeSandbox('allow-scripts allow-same-origin'),
    );

    expect(tokens.has('allow-same-origin')).toBe(false);
    expect(tokens.has('allow-scripts')).toBe(true);
  });

  it('should strip allow-same-origin even without allow-scripts', () => {
    const tokens = toTokenSet(sanitizeIframeSandbox('allow-same-origin'));

    expect(tokens.has('allow-same-origin')).toBe(false);
  });

  it('should strip top-navigation tokens that could redirect the Twenty tab', () => {
    const tokens = toTokenSet(
      sanitizeIframeSandbox(
        'allow-scripts allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols',
      ),
    );

    expect(tokens.has('allow-top-navigation')).toBe(false);
    expect(tokens.has('allow-top-navigation-by-user-activation')).toBe(false);
    expect(tokens.has('allow-top-navigation-to-custom-protocols')).toBe(false);
  });

  it('should strip allow-popups-to-escape-sandbox', () => {
    const tokens = toTokenSet(
      sanitizeIframeSandbox('allow-popups allow-popups-to-escape-sandbox'),
    );

    expect(tokens.has('allow-popups')).toBe(true);
    expect(tokens.has('allow-popups-to-escape-sandbox')).toBe(false);
  });

  it('should be case-insensitive when stripping denylisted tokens', () => {
    const tokens = toTokenSet(
      sanitizeIframeSandbox('ALLOW-SCRIPTS Allow-Same-Origin'),
    );

    expect(tokens.has('allow-same-origin')).toBe(false);
    expect(tokens.has('allow-scripts')).toBe(true);
  });

  it('should never grant same-origin for a srcDoc iframe requesting it', () => {
    const tokens = toTokenSet(
      sanitizeIframeSandbox('allow-scripts allow-same-origin'),
    );

    expect(tokens.has('allow-same-origin')).toBe(false);
  });

  it('should ignore non-string sandbox values and fall back to the default', () => {
    const tokens = toTokenSet(sanitizeIframeSandbox(42));

    expect(tokens.has('allow-scripts')).toBe(true);
    expect(tokens.has('allow-same-origin')).toBe(false);
  });
});
