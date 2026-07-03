import { type ReactElement } from 'react';

import { createCaretPreservingElement } from '../createCaretPreservingElement';

const getProps = (element: ReactElement): Record<string, unknown> =>
  element.props as Record<string, unknown>;

describe('createCaretPreservingElement', () => {
  it('should create an element of the requested tag', () => {
    const element = createCaretPreservingElement(
      'input',
      { type: 'text' },
      undefined,
      null,
    );

    expect(element.type).toBe('input');
    expect(getProps(element).type).toBe('text');
  });

  it('should seed the initial value from value', () => {
    const element = createCaretPreservingElement(
      'input',
      { value: 'hello' },
      undefined,
      null,
    );

    expect(getProps(element).defaultValue).toBe('hello');
  });

  it('should prefer defaultValue over value for the initial value', () => {
    const element = createCaretPreservingElement(
      'input',
      { value: 'v', defaultValue: 'd' },
      undefined,
      null,
    );

    expect(getProps(element).defaultValue).toBe('d');
  });

  it('should apply forced props', () => {
    const element = createCaretPreservingElement(
      'textarea',
      {},
      { readOnly: true },
      null,
    );

    expect(getProps(element).readOnly).toBe(true);
  });

  it('should notify focus state and forward the original focus handler', () => {
    const setEditableFocused = jest.fn();
    const onFocus = jest.fn();
    const element = createCaretPreservingElement(
      'input',
      { onFocus },
      undefined,
      setEditableFocused,
    );

    const event = {} as never;
    (getProps(element).onFocus as (event: unknown) => void)(event);

    expect(setEditableFocused).toHaveBeenCalledWith(true);
    expect(onFocus).toHaveBeenCalledWith(event);
  });

  it('should notify blur state', () => {
    const setEditableFocused = jest.fn();
    const element = createCaretPreservingElement(
      'input',
      {},
      undefined,
      setEditableFocused,
    );

    (getProps(element).onBlur as (event: unknown) => void)({} as never);

    expect(setEditableFocused).toHaveBeenCalledWith(false);
  });
});
