import { type MouseEvent } from 'react';

import { createAnchorNavigationClickHandler } from '../createAnchorNavigationClickHandler';

const createMouseEvent = (button: number) => {
  const preventDefault = jest.fn();

  return {
    event: {
      button,
      preventDefault,
    } as unknown as MouseEvent<HTMLAnchorElement>,
    preventDefault,
  };
};

describe('createAnchorNavigationClickHandler', () => {
  it('should prevent default and request navigation for an external primary click', () => {
    const requestExternalNavigation = jest.fn();
    const remoteOnClick = jest.fn();
    const { event, preventDefault } = createMouseEvent(0);

    createAnchorNavigationClickHandler({
      href: 'https://example.com/probe',
      target: undefined,
      remoteOnClick,
      requestExternalNavigation,
    })(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(requestExternalNavigation).toHaveBeenCalledWith({
      url: 'https://example.com/probe',
      target: undefined,
    });
    expect(remoteOnClick).toHaveBeenCalledWith(event);
  });

  it('should forward the anchor target when requesting navigation', () => {
    const requestExternalNavigation = jest.fn();
    const { event } = createMouseEvent(0);

    createAnchorNavigationClickHandler({
      href: 'https://example.com/probe',
      target: '_blank',
      remoteOnClick: undefined,
      requestExternalNavigation,
    })(event);

    expect(requestExternalNavigation).toHaveBeenCalledWith({
      url: 'https://example.com/probe',
      target: '_blank',
    });
  });

  it('should not intercept a same-origin click but still forward it', () => {
    const requestExternalNavigation = jest.fn();
    const remoteOnClick = jest.fn();
    const { event, preventDefault } = createMouseEvent(0);

    createAnchorNavigationClickHandler({
      href: 'http://localhost/objects/people',
      target: undefined,
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
      target: undefined,
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
      target: undefined,
      remoteOnClick,
      requestExternalNavigation,
    })(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(requestExternalNavigation).toHaveBeenCalledTimes(1);
    expect(remoteOnClick).not.toHaveBeenCalled();
  });

  it('should ignore a right click', () => {
    const requestExternalNavigation = jest.fn();
    const remoteOnClick = jest.fn();
    const { event, preventDefault } = createMouseEvent(2);

    createAnchorNavigationClickHandler({
      href: 'https://example.com/probe',
      target: undefined,
      remoteOnClick,
      requestExternalNavigation,
    })(event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(requestExternalNavigation).not.toHaveBeenCalled();
    expect(remoteOnClick).not.toHaveBeenCalled();
  });
});
