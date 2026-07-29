import { normalizeMutationObserverInit } from '@/polyfills/dom/utils/normalizeMutationObserverInit';

describe('normalizeMutationObserverInit', () => {
  it('turns attributes on when only attributeFilter is given', () => {
    expect(
      normalizeMutationObserverInit({ attributeFilter: ['data-open'] }),
    ).toEqual({
      attributes: true,
      characterData: false,
      attributeFilter: ['data-open'],
    });
  });

  it('turns attributes on when only attributeOldValue is given', () => {
    expect(normalizeMutationObserverInit({ attributeOldValue: true })).toEqual({
      attributes: true,
      characterData: false,
      attributeOldValue: true,
    });
  });

  it('turns characterData on when only characterDataOldValue is given', () => {
    expect(
      normalizeMutationObserverInit({ characterDataOldValue: true }),
    ).toEqual({
      attributes: false,
      characterData: true,
      characterDataOldValue: true,
    });
  });

  it('keeps the options untouched when they are already explicit', () => {
    expect(
      normalizeMutationObserverInit({
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
      }),
    ).toEqual({
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });
  });

  it('rejects attribute refinements when attributes is explicitly off', () => {
    expect(() =>
      normalizeMutationObserverInit({
        attributes: false,
        attributeFilter: ['data-open'],
      }),
    ).toThrow(TypeError);
  });

  it('rejects characterDataOldValue when characterData is explicitly off', () => {
    expect(() =>
      normalizeMutationObserverInit({
        characterData: false,
        characterDataOldValue: true,
      }),
    ).toThrow(TypeError);
  });

  it('rejects options that observe nothing', () => {
    expect(() => normalizeMutationObserverInit({})).toThrow(TypeError);
    expect(() => normalizeMutationObserverInit({ subtree: true })).toThrow(
      TypeError,
    );
  });
});
