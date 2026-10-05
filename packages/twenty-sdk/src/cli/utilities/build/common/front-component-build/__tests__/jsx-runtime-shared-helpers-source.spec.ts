import * as esbuild from 'esbuild';
import { describe, expect, it, vi } from 'vitest';

import { JSX_RUNTIME_SHARED_HELPERS_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-shared-helpers-source';

type EventHandler = (event: Event) => void;
type EventSource = 'jsx' | 'clone';
type EventRef = ((element: EventTarget | null) => unknown) & {
  _eventSource?: EventSource;
};
type ClonedElement = { type: string; props: Record<string, unknown> };

type SharedHelpers = {
  makeEventRef: (
    events: Record<string, EventHandler> | null,
    userRef: unknown,
    source: EventSource,
  ) => EventRef;
  isCustomElementTag: (type: unknown) => boolean;
  withCloneEventRef: (
    element: ClonedElement,
    config: Record<string, unknown> | null,
    readsElementRefFromVnode: boolean,
  ) => Record<string, unknown> & { ref: EventRef };
};

const loadSharedHelpers = (): SharedHelpers => {
  const { code } = esbuild.transformSync(JSX_RUNTIME_SHARED_HELPERS_SOURCE, {
    format: 'cjs',
    loader: 'js',
  });
  const helpersModule = { exports: {} };

  new Function('module', 'exports', 'globalThis', code)(
    helpersModule,
    helpersModule.exports,
    { __HTML_TAG_TO_CUSTOM_ELEMENT_TAG__: { button: 'html-button' } },
  );

  return helpersModule.exports as SharedHelpers;
};

const createSyntheticLikeEvent = (type: string): Event => {
  const event = new Event(type);

  return Object.assign(event, { nativeEvent: event });
};

describe('jsx runtime shared helpers', () => {
  it('should recognize only the custom element tags of the sandbox', () => {
    const { isCustomElementTag } = loadSharedHelpers();

    expect(isCustomElementTag('html-button')).toBe(true);
    expect(isCustomElementTag('button')).toBe(false);
    expect(isCustomElementTag(undefined)).toBe(false);
  });

  it('should run the element handler before the handler a clone added', () => {
    const { makeEventRef, withCloneEventRef } = loadSharedHelpers();
    const element = new EventTarget();
    const calls: string[] = [];

    withCloneEventRef(
      {
        type: 'html-button',
        props: {
          ref: makeEventRef({ onClick: () => calls.push('jsx') }, null, 'jsx'),
        },
      },
      { onClick: () => calls.push('clone') },
      false,
    ).ref(element);
    element.dispatchEvent(new Event('click'));

    expect(calls).toEqual(['jsx', 'clone']);
  });

  it('should stop running a handler once its prop is gone', () => {
    const { makeEventRef } = loadSharedHelpers();
    const element = new EventTarget();
    const handleClick = vi.fn();
    const removeEventListener = vi.spyOn(element, 'removeEventListener');

    makeEventRef({ onClick: handleClick }, null, 'jsx')(element);
    makeEventRef(null, null, 'jsx')(element);
    element.dispatchEvent(new Event('click'));

    expect(handleClick).not.toHaveBeenCalled();
    expect(removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('should keep one listener per event type so removing one type leaves the others', () => {
    const { makeEventRef } = loadSharedHelpers();
    const element = new EventTarget();
    const handleKeyDown = vi.fn();
    const addEventListener = vi.spyOn(element, 'addEventListener');
    const removeEventListener = vi.spyOn(element, 'removeEventListener');

    makeEventRef(
      { onClick: vi.fn(), onKeyDown: handleKeyDown },
      null,
      'jsx',
    )(element);
    makeEventRef({ onKeyDown: handleKeyDown }, null, 'jsx')(element);
    element.dispatchEvent(new Event('keydown'));

    const [clickListener, keyDownListener] = addEventListener.mock.calls.map(
      (call) => call[1],
    );
    expect(clickListener).not.toBe(keyDownListener);
    expect(removeEventListener).toHaveBeenCalledWith(
      'click',
      clickListener,
      false,
    );
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('should register capture props as capture listeners of the base event type', () => {
    const { makeEventRef } = loadSharedHelpers();
    const element = new EventTarget();
    const addEventListener = vi.spyOn(element, 'addEventListener');

    makeEventRef(
      { onKeyDownCapture: vi.fn(), onLostPointerCapture: vi.fn() },
      null,
      'jsx',
    )(element);

    expect(
      addEventListener.mock.calls.map(([type, , capture]) => [type, capture]),
    ).toEqual([
      ['keydown', true],
      ['lostpointercapture', false],
    ]);
  });

  it('should let the element handler prevent the handler a clone added, as Base UI merging does', () => {
    const { makeEventRef, withCloneEventRef } = loadSharedHelpers();
    const element = new EventTarget();
    const handleElementClick = vi.fn(
      (event: Event & { preventBaseUIHandler?: () => void }) =>
        event.preventBaseUIHandler?.(),
    );
    const handleClonedClick = vi.fn();

    withCloneEventRef(
      {
        type: 'html-button',
        props: {
          ref: makeEventRef({ onClick: handleElementClick }, null, 'jsx'),
        },
      },
      { onClick: handleClonedClick },
      false,
    ).ref(element);
    element.dispatchEvent(createSyntheticLikeEvent('click'));

    expect(handleElementClick).toHaveBeenCalledTimes(1);
    expect(handleClonedClick).not.toHaveBeenCalled();
  });

  it('should pass the element to the user ref and return its cleanup', () => {
    const { makeEventRef } = loadSharedHelpers();
    const element = new EventTarget();
    const cleanup = vi.fn();
    const objectRef = { current: null as EventTarget | null };

    expect(
      makeEventRef({ onClick: vi.fn() }, () => cleanup, 'jsx')(element),
    ).toBe(cleanup);

    makeEventRef(null, objectRef, 'jsx')(element);
    expect(objectRef.current).toBe(element);
  });

  it('should reuse one ref for elements without handlers so their refs do not change on every render', () => {
    const { makeEventRef } = loadSharedHelpers();
    const userRef = vi.fn();

    expect(makeEventRef(null, null, 'jsx')).toBe(
      makeEventRef(null, null, 'jsx'),
    );
    expect(makeEventRef(null, userRef, 'jsx')).toBe(
      makeEventRef(null, userRef, 'jsx'),
    );
  });

  it('should keep the element ref when a clone passes an undefined ref', () => {
    const { makeEventRef, withCloneEventRef } = loadSharedHelpers();
    const element = new EventTarget();
    const handleElementClick = vi.fn();
    const handleClonedKeyDown = vi.fn();
    const elementRef = makeEventRef(
      { onClick: handleElementClick },
      null,
      'jsx',
    );

    const clonedConfig = withCloneEventRef(
      { type: 'html-button', props: { ref: elementRef } },
      { onKeyDown: handleClonedKeyDown, ref: undefined },
      false,
    );
    clonedConfig.ref(element);
    element.dispatchEvent(new Event('click'));
    element.dispatchEvent(new Event('keydown'));

    expect(handleElementClick).toHaveBeenCalledTimes(1);
    expect(handleClonedKeyDown).toHaveBeenCalledTimes(1);
  });

  it('should stop running the handlers a clone added once the element renders without the clone', () => {
    const { makeEventRef, withCloneEventRef } = loadSharedHelpers();
    const element = new EventTarget();
    const handleElementClick = vi.fn();
    const handleClonedClick = vi.fn();
    const handleClonedKeyDown = vi.fn();

    const clonedConfig = withCloneEventRef(
      {
        type: 'html-button',
        props: {
          ref: makeEventRef({ onClick: handleElementClick }, null, 'jsx'),
        },
      },
      { onClick: handleClonedClick, onKeyDown: handleClonedKeyDown },
      false,
    );
    clonedConfig.ref(element);
    clonedConfig.ref(null);
    makeEventRef({ onClick: handleElementClick }, null, 'jsx')(element);
    element.dispatchEvent(createSyntheticLikeEvent('click'));
    element.dispatchEvent(new Event('keydown'));

    expect(handleElementClick).toHaveBeenCalledTimes(1);
    expect(handleClonedClick).not.toHaveBeenCalled();
    expect(handleClonedKeyDown).not.toHaveBeenCalled();
  });

  it('should keep the handlers a clone added when the clone ref reaches the element ref through a merged ref', () => {
    const { makeEventRef, withCloneEventRef } = loadSharedHelpers();
    const element = new EventTarget();
    const handleElementClick = vi.fn();
    const handleClonedKeyDown = vi.fn();
    const elementRef = makeEventRef(
      { onClick: handleElementClick },
      null,
      'jsx',
    );
    const mergedRef = (mergedElement: EventTarget | null) => {
      elementRef(mergedElement);
    };

    const clonedConfig = withCloneEventRef(
      { type: 'html-button', props: { ref: elementRef } },
      { onKeyDown: handleClonedKeyDown, ref: mergedRef },
      false,
    );
    clonedConfig.ref(element);
    element.dispatchEvent(new Event('click'));
    element.dispatchEvent(new Event('keydown'));

    expect(handleElementClick).toHaveBeenCalledTimes(1);
    expect(handleClonedKeyDown).toHaveBeenCalledTimes(1);
  });

  it('should merge the handlers of nested clones, the outer clone winning per prop', () => {
    const { withCloneEventRef } = loadSharedHelpers();
    const element = new EventTarget();
    const calls: string[] = [];

    const innerConfig = withCloneEventRef(
      { type: 'html-button', props: {} },
      {
        onClick: () => calls.push('inner click'),
        onKeyDown: () => calls.push('inner keydown'),
      },
      false,
    );
    const outerConfig = withCloneEventRef(
      { type: 'html-button', props: { ref: innerConfig.ref } },
      { onClick: () => calls.push('outer click') },
      false,
    );
    outerConfig.ref(element);
    element.dispatchEvent(new Event('click'));
    element.dispatchEvent(new Event('keydown'));

    expect(calls).toEqual(['outer click', 'inner keydown']);
  });
});
