import { extractHostNativeEventHandlers } from '../extractHostNativeEventHandlers';

describe('extractHostNativeEventHandlers', () => {
  it('should extract focusin and focusout handlers from react props', () => {
    const onFocusIn = jest.fn();
    const onFocusOut = jest.fn();

    const { nativeEventHandlers, remainingProps } =
      extractHostNativeEventHandlers({ onFocusIn, onFocusOut, id: 'x' });

    expect(nativeEventHandlers).toEqual({
      focusin: onFocusIn,
      focusout: onFocusOut,
    });
    expect(remainingProps).toEqual({ id: 'x' });
  });

  it('should drop a native-only handler whose value is not a function', () => {
    const { nativeEventHandlers, remainingProps } =
      extractHostNativeEventHandlers({ onFocusIn: 'alert(1)' });

    expect(nativeEventHandlers).toEqual({});
    expect('onFocusIn' in remainingProps).toBe(false);
  });

  it('should leave other props untouched', () => {
    const onClick = jest.fn();

    const { nativeEventHandlers, remainingProps } =
      extractHostNativeEventHandlers({ onClick });

    expect(nativeEventHandlers).toEqual({});
    expect(remainingProps).toEqual({ onClick });
  });
});
