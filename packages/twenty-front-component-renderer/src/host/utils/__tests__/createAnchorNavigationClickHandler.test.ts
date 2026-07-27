import { type MouseEvent } from 'react';

import { createAnchorNavigationClickHandler } from '../createAnchorNavigationClickHandler';

const createMouseEvent = (
  button: number,
  modifierKeys: {
    metaKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
  } = {},
) => {
  const preventDefault = jest.fn();

  return {
    event: {
      button,
      preventDefault,
      metaKey: modifierKeys.metaKey ?? false,
      ctrlKey: modifierKeys.ctrlKey ?? false,
      shiftKey: modifierKeys.shiftKey ?? false,
    } as unknown as MouseEvent<HTMLAnchorElement>,
    preventDefault,
  };
};

describe('createAnchorNavigationClickHandler', () => {
  it('should intercept an external primary click without forwarding to the remote handler', () => {
    const requestExternalNavigation = jest.fn();
    const remoteOnClick = jest.fn();
    const { event, preventDefault } = createMouseEvent(0);

    createAnchorNavigationClickHandler({
      href: 'https://example.com/probe',
      remoteOnClick,
      requestExternalNavigation,
    })(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(requestExternalNavigation).toHaveBeenCalledWith({
      url: 'https://example.com/probe',
    });
    expect(remoteOnClick).not.toHaveBeenCalled();
  });

  it('should ignore the anchor target so the host always decides how to open the url', () => {
    const requestExternalNavigation = jest.fn();
    const { event } = createMouseEvent(0);

    createAnchorNavigationClickHandler({
      href: 'https://example.com/probe',
      remoteOnClick: undefined,
      requestExternalNavigation,
    })(event);

    expect(requestExternalNavigation).toHaveBeenCalledWith({
      url: 'https://example.com/probe',
    });
  });

  it('should not intercept a same-origin click but still forward it', () => {
    const requestExternalNavigation = jest.fn();
    const remoteOnClick = jest.fn();
    const { event, preventDefault } = createMouseEvent(0);

    createAnchorNavigationClickHandler({
      href: 'http://localhost/objects/people',
      remoteOnClick,
      requestExternalNavigation,
    })(event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(requestExternalNavigation).not.toHaveBeenCalled();
    expect(remoteOnClick).toHaveBeenCalledWith(event);
  });

  it('should not prevent default when no navigation handler is provided', () => {
    const remoteOnClick = jest.fn();
    const { event, preventDefault } = createMouseEvent(0);

    createAnchorNavigationClickHandler({
      href: 'https://example.com/probe',
      remoteOnClick,
      requestExternalNavigation: null,
    })(event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(remoteOnClick).toHaveBeenCalledWith(event);
  });

  it('should intercept an external middle click without forwarding to the remote handler', () => {
    const requestExternalNavigation = jest.fn();
    const remoteOnClick = jest.fn();
    const { event, preventDefault } = createMouseEvent(1);

    createAnchorNavigationClickHandler({
      href: 'https://example.com/probe',
      remoteOnClick,
      requestExternalNavigation,
    })(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(requestExternalNavigation).toHaveBeenCalledWith({
      url: 'https://example.com/probe',
    });
    expect(remoteOnClick).not.toHaveBeenCalled();
  });

  it.each([
    ['a cmd (meta) modifier', { metaKey: true }],
    ['a ctrl modifier', { ctrlKey: true }],
    ['a shift modifier', { shiftKey: true }],
  ] as Array<
    [string, { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }]
  >)(
    'should intercept a primary click with %s without forwarding to the remote handler',
    (_label, modifierKeys) => {
      const requestExternalNavigation = jest.fn();
      const remoteOnClick = jest.fn();
      const { event } = createMouseEvent(0, modifierKeys);

      createAnchorNavigationClickHandler({
        href: 'https://example.com/probe',
        remoteOnClick,
        requestExternalNavigation,
      })(event);

      expect(requestExternalNavigation).toHaveBeenCalledWith({
        url: 'https://example.com/probe',
      });
      expect(remoteOnClick).not.toHaveBeenCalled();
    },
  );

  it('should ignore a right click', () => {
    const requestExternalNavigation = jest.fn();
    const remoteOnClick = jest.fn();
    const { event, preventDefault } = createMouseEvent(2);

    createAnchorNavigationClickHandler({
      href: 'https://example.com/probe',
      remoteOnClick,
      requestExternalNavigation,
    })(event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(requestExternalNavigation).not.toHaveBeenCalled();
    expect(remoteOnClick).not.toHaveBeenCalled();
  });
});
