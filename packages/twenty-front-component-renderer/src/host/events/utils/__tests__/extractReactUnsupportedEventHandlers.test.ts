import { extractReactUnsupportedEventHandlers } from '../extractReactUnsupportedEventHandlers';

describe('extractReactUnsupportedEventHandlers', () => {
  it('should extract focusin and focusout handlers from react props', () => {
    const onFocusIn = jest.fn();
    const onFocusOut = jest.fn();

    const { reactUnsupportedEventHandlers, reactBindableProps } =
      extractReactUnsupportedEventHandlers({ onFocusIn, onFocusOut, id: 'x' });

    expect(reactUnsupportedEventHandlers).toEqual({
      focusin: onFocusIn,
      focusout: onFocusOut,
    });
    expect(reactBindableProps).toEqual({ id: 'x' });
  });

  it('should extract a beforeinput handler from react props', () => {
    const onBeforeInput = jest.fn();

    const { reactUnsupportedEventHandlers, reactBindableProps } =
      extractReactUnsupportedEventHandlers({ onBeforeInput, id: 'x' });

    expect(reactUnsupportedEventHandlers).toEqual({
      beforeinput: onBeforeInput,
    });
    expect(reactBindableProps).toEqual({ id: 'x' });
  });

  it('should drop a react-unsupported handler whose value is not a function', () => {
    const { reactUnsupportedEventHandlers, reactBindableProps } =
      extractReactUnsupportedEventHandlers({ onFocusIn: 'alert(1)' });

    expect(reactUnsupportedEventHandlers).toEqual({});
    expect('onFocusIn' in reactBindableProps).toBe(false);
  });

  it('should leave other props untouched', () => {
    const onClick = jest.fn();

    const { reactUnsupportedEventHandlers, reactBindableProps } =
      extractReactUnsupportedEventHandlers({ onClick });

    expect(reactUnsupportedEventHandlers).toEqual({});
    expect(reactBindableProps).toEqual({ onClick });
  });
});
