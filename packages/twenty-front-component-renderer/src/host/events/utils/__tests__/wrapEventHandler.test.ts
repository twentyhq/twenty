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
});
