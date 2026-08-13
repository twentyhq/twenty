import '@/testing/setupServerRenderingGlobals';

import { REMOTE_ELEMENT_PROP } from '@remote-dom/react/host';
import { act, createElement, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { jsx } from 'react/jsx-runtime';

import { createStubGeometryTracker } from '@/testing/createStubGeometryTracker';
import { FrontComponentGeometryTrackerContext } from '@/host/geometry/contexts/FrontComponentGeometryTrackerContext';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { createHtmlHostWrapper } from '../createHtmlHostWrapper';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createWrapperElement = (
  Wrapper: ComponentType<never>,
  props: Record<string, unknown>,
) => jsx(Wrapper as never, { ...props } as never);

describe('createHtmlHostWrapper geometry registration', () => {
  let container: HTMLDivElement;
  let root: Root;
  let geometryTracker: GeometryTracker;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    geometryTracker = createStubGeometryTracker();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  const renderWithTracker = (
    htmlTag: string,
    props: Record<string, unknown>,
  ) => {
    const Wrapper = createHtmlHostWrapper(htmlTag);

    act(() => {
      root.render(
        createElement(
          FrontComponentGeometryTrackerContext.Provider,
          { value: geometryTracker },
          createWrapperElement(Wrapper, props),
        ),
      );
    });

    return Wrapper;
  };

  it('should register the node on mount using the remote element id', () => {
    renderWithTracker('div', { [REMOTE_ELEMENT_PROP]: { id: '7' } });

    expect(geometryTracker.registerNode).toHaveBeenCalledTimes(1);
    expect(geometryTracker.registerNode).toHaveBeenCalledWith(
      '7',
      container.firstElementChild,
    );
  });

  it('should unregister the node on unmount', () => {
    renderWithTracker('div', { [REMOTE_ELEMENT_PROP]: { id: '7' } });
    const node = container.firstElementChild;

    act(() => {
      root.render(null);
    });

    expect(geometryTracker.unregisterNode).toHaveBeenCalledWith('7', node);
  });

  it('should register exactly once across repeated re-renders', () => {
    const Wrapper = renderWithTracker('div', {
      [REMOTE_ELEMENT_PROP]: { id: '7' },
      className: 'a',
    });

    for (const className of ['b', 'c', 'd']) {
      act(() => {
        root.render(
          createElement(
            FrontComponentGeometryTrackerContext.Provider,
            { value: geometryTracker },
            createWrapperElement(Wrapper, {
              [REMOTE_ELEMENT_PROP]: { id: '7' },
              className,
            }),
          ),
        );
      });
    }

    expect(geometryTracker.registerNode).toHaveBeenCalledTimes(1);
    expect(geometryTracker.unregisterNode).not.toHaveBeenCalled();
  });

  it('should register a text input exactly once across repeated re-renders', () => {
    const Wrapper = renderWithTracker('input', {
      [REMOTE_ELEMENT_PROP]: { id: '7' },
      type: 'text',
      value: 'a',
    });

    for (const value of ['ab', 'abc']) {
      act(() => {
        root.render(
          createElement(
            FrontComponentGeometryTrackerContext.Provider,
            { value: geometryTracker },
            createWrapperElement(Wrapper, {
              [REMOTE_ELEMENT_PROP]: { id: '7' },
              type: 'text',
              value,
            }),
          ),
        );
      });
    }

    expect(geometryTracker.registerNode).toHaveBeenCalledTimes(1);
    expect((container.firstElementChild as HTMLInputElement).value).toBe('abc');
  });

  it('should not register when there is no tracker in context', () => {
    const Wrapper = createHtmlHostWrapper('div');

    act(() => {
      root.render(
        createWrapperElement(Wrapper, { [REMOTE_ELEMENT_PROP]: { id: '7' } }),
      );
    });

    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(geometryTracker.registerNode).not.toHaveBeenCalled();
  });
});
