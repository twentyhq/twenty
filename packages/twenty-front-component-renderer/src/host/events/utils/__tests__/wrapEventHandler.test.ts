import { wrapEventHandler } from '../wrapEventHandler';

describe('wrapEventHandler', () => {
  it('should return a function', () => {
    expect(typeof wrapEventHandler(() => {})).toBe('function');
  });

  it('should invoke the handler with the serialized event', () => {
    const handler = jest.fn();

    wrapEventHandler(handler)({ type: 'click', clientX: 3 });

    expect(handler).toHaveBeenCalledWith({ type: 'click', clientX: 3 });
  });

  it('should serialize away non-whitelisted event fields before calling the handler', () => {
    const handler = jest.fn();

    wrapEventHandler(handler)({ type: 'click', secret: 'leaked' });

    expect(handler).toHaveBeenCalledWith({ type: 'click' });
  });

  it('should leave the default alone when no rule is given', () => {
    const preventDefault = jest.fn();

    wrapEventHandler(jest.fn())({ type: 'keydown', key: 'Enter', preventDefault });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('should prevent the default on a matching rule, before the handler runs', () => {
    const calls: string[] = [];
    const preventDefault = jest.fn(() => calls.push('preventDefault'));
    const handler = jest.fn(() => calls.push('handler'));

    wrapEventHandler(handler, ['keydown:Enter'])({
      type: 'keydown',
      key: 'Enter',
      preventDefault,
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    // The order is the point: the guest's handler cannot do this itself, because
    // by the time it runs the host has already returned to the browser.
    expect(calls).toEqual(['preventDefault', 'handler']);
  });

  it('should not prevent the default on a rule that does not match', () => {
    const preventDefault = jest.fn();

    wrapEventHandler(jest.fn(), ['keydown:Enter'])({
      type: 'keydown',
      key: 'Enter',
      shiftKey: true,
      preventDefault,
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('should still call the handler when it prevents the default', () => {
    const handler = jest.fn();

    wrapEventHandler(handler, ['submit'])({
      type: 'submit',
      preventDefault: jest.fn(),
    });

    expect(handler).toHaveBeenCalledWith({ type: 'submit' });
  });

  it('should survive an event that cannot be prevented', () => {
    const handler = jest.fn();

    expect(() =>
      wrapEventHandler(handler, ['keydown:Enter'])({
        type: 'keydown',
        key: 'Enter',
      }),
    ).not.toThrow();

    expect(handler).toHaveBeenCalled();
  });
});
