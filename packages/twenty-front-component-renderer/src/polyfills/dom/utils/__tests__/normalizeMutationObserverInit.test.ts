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

  it('rejects attributeFilter when attributes is explicitly off', () => {
    expect(() =>
      normalizeMutationObserverInit({
        childList: true,
        attributes: false,
        attributeFilter: ['data-open'],
      }),
    ).toThrow(TypeError);
  });

  it('rejects attributeOldValue set to true when attributes is explicitly off', () => {
    expect(() =>
      normalizeMutationObserverInit({
        childList: true,
        attributes: false,
        attributeOldValue: true,
      }),
    ).toThrow(TypeError);
  });

  it('rejects characterDataOldValue set to true when characterData is explicitly off', () => {
    expect(() =>
      normalizeMutationObserverInit({
        childList: true,
        characterData: false,
        characterDataOldValue: true,
      }),
    ).toThrow(TypeError);
  });

  it('accepts attributeOldValue set to false when attributes is explicitly off', () => {
    expect(
      normalizeMutationObserverInit({
        childList: true,
        attributes: false,
        attributeOldValue: false,
      }),
    ).toEqual({
      childList: true,
      attributes: false,
      characterData: false,
      attributeOldValue: false,
    });
  });

  it('accepts characterDataOldValue set to false when characterData is explicitly off', () => {
    expect(
      normalizeMutationObserverInit({
        childList: true,
        characterData: false,
        characterDataOldValue: false,
      }),
    ).toEqual({
      childList: true,
      attributes: false,
      characterData: false,
      characterDataOldValue: false,
    });
  });

  it('rejects options that observe nothing', () => {
    expect(() => normalizeMutationObserverInit({})).toThrow(TypeError);
    expect(() => normalizeMutationObserverInit({ subtree: true })).toThrow(
      TypeError,
    );
  });

  it('reports the empty observation before the refinement mismatch', () => {
    expect(() =>
      normalizeMutationObserverInit({
        attributes: false,
        attributeOldValue: true,
      }),
    ).toThrow(/at least one of/);
  });

  it('copies attributeFilter so the caller cannot change it after observe', () => {
    const attributeFilter = ['data-open'];

    const normalizedOptions = normalizeMutationObserverInit({
      attributes: true,
      attributeFilter,
    });

    attributeFilter.push('data-closed');

    expect(normalizedOptions.attributeFilter).toEqual(['data-open']);
    expect(normalizedOptions.attributeFilter).not.toBe(attributeFilter);
  });
});
