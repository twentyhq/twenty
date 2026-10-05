import * as esbuild from 'esbuild';
import { describe, expect, it, vi } from 'vitest';

import { JSX_RUNTIME_SHARED_HELPERS_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-shared-helpers-source';

type EventHandler = (event: Event) => void;
type EventSource = 'jsx' | 'clone';
type EventRef = ((element: EventTarget | null) => (() => void) | undefined) & {
  _eventSource?: EventSource;
};
type ClonedElement = {
  type: string;
  props: Record<string, unknown>;
  ref?: unknown;
};
type PreventableEvent = Event & { preventBaseUIHandler?: () => void };

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

const createMergedRef =
  (...refs: EventRef[]) =>
  (element: EventTarget | null) => {
    for (const ref of refs) {
      ref(element);
    }
  };

const dispatchSyntheticLikeEvents = (
  element: EventTarget,
  eventTypes: string[],
) => {
  for (const eventType of eventTypes) {
    element.dispatchEvent(createSyntheticLikeEvent(eventType));
  }
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

  it.each([
    { runtime: 'React', readsElementRefFromVnode: false },
    { runtime: 'Preact', readsElementRefFromVnode: true },
  ])(
    'should keep the element handlers and replace only its user ref when a $runtime clone overrides the ref',
    ({ readsElementRefFromVnode }) => {
      const { makeEventRef, withCloneEventRef } = loadSharedHelpers();
      const element = new EventTarget();
      const handleElementClick = vi.fn();
      const elementUserRef = vi.fn();
      const cloneUserRef = vi.fn();
      const elementRef = makeEventRef(
        { onClick: handleElementClick },
        elementUserRef,
        'jsx',
      );

      withCloneEventRef(
        readsElementRefFromVnode
          ? { type: 'html-button', props: {}, ref: elementRef }
          : { type: 'html-button', props: { ref: elementRef } },
        { ref: cloneUserRef },
        readsElementRefFromVnode,
      ).ref(element);
      element.dispatchEvent(new Event('click'));

      expect(handleElementClick).toHaveBeenCalledTimes(1);
      expect(cloneUserRef.mock.calls).toEqual([[element]]);
      expect(elementUserRef).not.toHaveBeenCalled();
    },
  );

  it.each([
    { runtime: 'React', readsElementRefFromVnode: false },
    { runtime: 'Preact', readsElementRefFromVnode: true },
  ])(
    'should keep the element handlers and drop its user ref when a $runtime clone clears the ref',
    ({ readsElementRefFromVnode }) => {
      const { makeEventRef, withCloneEventRef } = loadSharedHelpers();
      const element = new EventTarget();
      const handleElementClick = vi.fn();
      const elementUserRef = vi.fn();
      const elementRef = makeEventRef(
        { onClick: handleElementClick },
        elementUserRef,
        'jsx',
      );

      withCloneEventRef(
        readsElementRefFromVnode
          ? { type: 'html-button', props: {}, ref: elementRef }
          : { type: 'html-button', props: { ref: elementRef } },
        { ref: null },
        readsElementRefFromVnode,
      ).ref(element);
      element.dispatchEvent(new Event('click'));

      expect(handleElementClick).toHaveBeenCalledTimes(1);
      expect(elementUserRef).not.toHaveBeenCalled();
    },
  );

  it('should keep the handlers of an inner clone when an outer clone overrides the ref', () => {
    const { makeEventRef, withCloneEventRef } = loadSharedHelpers();
    const element = new EventTarget();
    const calls: string[] = [];
    const innerConfig = withCloneEventRef(
      {
        type: 'html-button',
        props: {
          ref: makeEventRef(
            { onClick: () => calls.push('element click') },
            () => calls.push('element ref'),
            'jsx',
          ),
        },
      },
      { onKeyDown: () => calls.push('inner clone keydown') },
      false,
    );

    withCloneEventRef(
      { type: 'html-button', props: { ref: innerConfig.ref } },
      { ref: () => calls.push('outer clone ref') },
      false,
    ).ref(element);
    element.dispatchEvent(new Event('click'));
    element.dispatchEvent(new Event('keydown'));

    expect(calls).toEqual([
      'outer clone ref',
      'element click',
      'inner clone keydown',
    ]);
  });

  it.each([
    {
      runtime: 'React',
      readsElementRefFromVnode: false,
      cloneRefDescription: 'the same ref',
      cloneRef: vi.fn(),
    },
    {
      runtime: 'Preact',
      readsElementRefFromVnode: true,
      cloneRefDescription: 'the same ref',
      cloneRef: vi.fn(),
    },
    {
      runtime: 'React',
      readsElementRefFromVnode: false,
      cloneRefDescription: 'null',
      cloneRef: null,
    },
    {
      runtime: 'Preact',
      readsElementRefFromVnode: true,
      cloneRefDescription: 'null',
      cloneRef: null,
    },
  ])(
    'should reuse one ref when $runtime clones of an element with handlers override its ref with $cloneRefDescription',
    ({ readsElementRefFromVnode, cloneRef }) => {
      const { makeEventRef, withCloneEventRef } = loadSharedHelpers();
      const elementRef = makeEventRef({ onClick: vi.fn() }, vi.fn(), 'jsx');
      const element = readsElementRefFromVnode
        ? { type: 'html-button', props: {}, ref: elementRef }
        : { type: 'html-button', props: { ref: elementRef } };

      expect(
        withCloneEventRef(element, { ref: cloneRef }, readsElementRefFromVnode)
          .ref,
      ).toBe(
        withCloneEventRef(
          element,
          { ref: cloneRef, 'data-render-count': 1 },
          readsElementRefFromVnode,
        ).ref,
      );
    },
  );

  it('should reuse the element ref when a clone neither adds handlers nor overrides the ref', () => {
    const { makeEventRef, withCloneEventRef } = loadSharedHelpers();
    const elementRef = makeEventRef({ onClick: vi.fn() }, vi.fn(), 'jsx');

    expect(
      withCloneEventRef(
        { type: 'html-button', props: { ref: elementRef } },
        { 'aria-label': 'Cloned', ref: undefined },
        false,
      ).ref,
    ).toBe(elementRef);
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

  describe.each([
    { runtimeName: 'React', readsElementRefFromVnode: false },
    { runtimeName: 'Preact', readsElementRefFromVnode: true },
  ])('nested clones in $runtimeName', ({ readsElementRefFromVnode }) => {
    const toClonedElement = (elementRef: unknown): ClonedElement =>
      readsElementRefFromVnode
        ? { type: 'html-button', props: {}, ref: elementRef }
        : { type: 'html-button', props: { ref: elementRef } };

    const cloneElementRef = (
      sharedHelpers: SharedHelpers,
      elementRef: EventRef,
      config: Record<string, unknown>,
    ) =>
      sharedHelpers.withCloneEventRef(
        toClonedElement(elementRef),
        config,
        readsElementRefFromVnode,
      ).ref;

    const cloneElementRefWithMergedRef = (
      sharedHelpers: SharedHelpers,
      elementRef: EventRef,
      config: Record<string, unknown>,
    ) =>
      cloneElementRef(sharedHelpers, elementRef, {
        ...config,
        ref: createMergedRef(elementRef),
      });

    const recordCall =
      (calls: string[], name: string, preventsBaseUIHandler = false) =>
      (event: PreventableEvent) => {
        calls.push(name);
        if (preventsBaseUIHandler) {
          event.preventBaseUIHandler?.();
        }
      };

    it('should run the inner clone handlers before the handlers of a clone whose ref calls the element ref', () => {
      const sharedHelpers = loadSharedHelpers();
      const element = new EventTarget();
      const calls: string[] = [];

      const jsxRef = sharedHelpers.makeEventRef(
        { onClick: recordCall(calls, 'jsx') },
        null,
        'jsx',
      );
      const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
        onClick: recordCall(calls, 'inner'),
        onKeyDown: recordCall(calls, 'inner keydown'),
      });
      cloneElementRefWithMergedRef(sharedHelpers, innerCloneRef, {
        onClick: recordCall(calls, 'outer'),
      })(element);
      dispatchSyntheticLikeEvents(element, ['click', 'keydown']);

      expect(calls).toEqual(['jsx', 'inner', 'outer', 'inner keydown']);
    });

    it('should chain the handlers of every clone whose ref calls the element ref, innermost first', () => {
      const sharedHelpers = loadSharedHelpers();
      const element = new EventTarget();
      const calls: string[] = [];

      const jsxRef = sharedHelpers.makeEventRef(
        { onClick: recordCall(calls, 'jsx') },
        null,
        'jsx',
      );
      const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
        onClick: recordCall(calls, 'inner'),
      });
      const middleCloneRef = cloneElementRefWithMergedRef(
        sharedHelpers,
        innerCloneRef,
        { onClick: recordCall(calls, 'middle') },
      );
      cloneElementRefWithMergedRef(sharedHelpers, middleCloneRef, {
        onClick: recordCall(calls, 'outer'),
      })(element);
      dispatchSyntheticLikeEvents(element, ['click']);

      expect(calls).toEqual(['jsx', 'inner', 'middle', 'outer']);
    });

    it('should let an inner clone handler prevent the handlers of every ref-merging clone around it', () => {
      const sharedHelpers = loadSharedHelpers();
      const element = new EventTarget();
      const calls: string[] = [];

      const jsxRef = sharedHelpers.makeEventRef(
        { onClick: recordCall(calls, 'jsx') },
        null,
        'jsx',
      );
      const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
        onClick: recordCall(calls, 'inner', true),
      });
      const middleCloneRef = cloneElementRefWithMergedRef(
        sharedHelpers,
        innerCloneRef,
        { onClick: recordCall(calls, 'middle') },
      );
      cloneElementRefWithMergedRef(sharedHelpers, middleCloneRef, {
        onClick: recordCall(calls, 'outer'),
      })(element);
      dispatchSyntheticLikeEvents(element, ['click']);

      expect(calls).toEqual(['jsx', 'inner']);
    });

    it('should let the element handler prevent the handlers of every clone', () => {
      const sharedHelpers = loadSharedHelpers();
      const element = new EventTarget();
      const calls: string[] = [];

      const jsxRef = sharedHelpers.makeEventRef(
        { onClick: recordCall(calls, 'jsx', true) },
        null,
        'jsx',
      );
      const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
        onClick: recordCall(calls, 'inner'),
      });
      cloneElementRefWithMergedRef(sharedHelpers, innerCloneRef, {
        onClick: recordCall(calls, 'outer'),
      })(element);
      dispatchSyntheticLikeEvents(element, ['click']);

      expect(calls).toEqual(['jsx']);
    });

    it('should keep the handlers of a ref-merging clone around a clone without handlers', () => {
      const sharedHelpers = loadSharedHelpers();
      const element = new EventTarget();
      const calls: string[] = [];

      const jsxRef = sharedHelpers.makeEventRef(
        { onClick: recordCall(calls, 'jsx') },
        null,
        'jsx',
      );
      const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
        className: 'inner',
      });
      cloneElementRefWithMergedRef(sharedHelpers, innerCloneRef, {
        onClick: recordCall(calls, 'outer'),
      })(element);
      dispatchSyntheticLikeEvents(element, ['click']);

      expect(calls).toEqual(['jsx', 'outer']);
    });

    it('should keep the inner clone handlers and remove listeners left without handlers once the ref-merging clone goes away', () => {
      const sharedHelpers = loadSharedHelpers();
      const element = new EventTarget();
      const removeEventListener = vi.spyOn(element, 'removeEventListener');
      const calls: string[] = [];

      const jsxRef = sharedHelpers.makeEventRef(
        { onClick: recordCall(calls, 'jsx') },
        null,
        'jsx',
      );
      const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
        onClick: recordCall(calls, 'inner'),
      });
      const outerCloneRef = cloneElementRefWithMergedRef(
        sharedHelpers,
        innerCloneRef,
        {
          onClick: recordCall(calls, 'outer'),
          onFocus: recordCall(calls, 'outer focus'),
        },
      );
      outerCloneRef(element);
      outerCloneRef(null);
      innerCloneRef(element);
      dispatchSyntheticLikeEvents(element, ['click', 'focus']);

      expect(calls).toEqual(['jsx', 'inner']);
      expect(removeEventListener.mock.calls.map(([type]) => type)).toEqual([
        'focus',
      ]);
    });

    it('should keep the ref-merging clone handlers and remove listeners left without handlers once the inner clone goes away', () => {
      const sharedHelpers = loadSharedHelpers();
      const element = new EventTarget();
      const removeEventListener = vi.spyOn(element, 'removeEventListener');
      const calls: string[] = [];
      const handleJsxClick = recordCall(calls, 'jsx');
      const handleOuterClick = recordCall(calls, 'outer');

      const jsxRef = sharedHelpers.makeEventRef(
        { onClick: handleJsxClick },
        null,
        'jsx',
      );
      const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
        onClick: recordCall(calls, 'inner'),
        onKeyDown: recordCall(calls, 'inner keydown'),
      });
      const outerCloneRef = cloneElementRefWithMergedRef(
        sharedHelpers,
        innerCloneRef,
        { onClick: handleOuterClick },
      );
      outerCloneRef(element);
      outerCloneRef(null);
      const rerenderedJsxRef = sharedHelpers.makeEventRef(
        { onClick: handleJsxClick },
        null,
        'jsx',
      );
      cloneElementRefWithMergedRef(sharedHelpers, rerenderedJsxRef, {
        onClick: handleOuterClick,
      })(element);
      dispatchSyntheticLikeEvents(element, ['click', 'keydown']);

      expect(calls).toEqual(['jsx', 'outer']);
      expect(removeEventListener.mock.calls.map(([type]) => type)).toEqual([
        'keydown',
      ]);
    });

    it('should run each nested clone handler once after a re-render', () => {
      const sharedHelpers = loadSharedHelpers();
      const element = new EventTarget();
      const calls: string[] = [];
      const renderOuterCloneRef = () => {
        const jsxRef = sharedHelpers.makeEventRef(
          { onClick: recordCall(calls, 'jsx') },
          null,
          'jsx',
        );
        const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
          onClick: recordCall(calls, 'inner'),
        });
        return cloneElementRefWithMergedRef(sharedHelpers, innerCloneRef, {
          onClick: recordCall(calls, 'outer'),
        });
      };

      const firstOuterCloneRef = renderOuterCloneRef();
      firstOuterCloneRef(element);
      const secondOuterCloneRef = renderOuterCloneRef();
      firstOuterCloneRef(null);
      secondOuterCloneRef(element);
      dispatchSyntheticLikeEvents(element, ['click']);

      expect(calls).toEqual(['jsx', 'inner', 'outer']);
    });

    it('should reuse the ref of nested clones without handlers so their refs do not change on every render', () => {
      const sharedHelpers = loadSharedHelpers();
      const jsxRef = sharedHelpers.makeEventRef(null, null, 'jsx');
      const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
        className: 'inner',
      });
      const mergedRef = createMergedRef(innerCloneRef);
      const renderRefMergingCloneRef = () =>
        cloneElementRef(sharedHelpers, innerCloneRef, { ref: mergedRef });
      const renderPlainCloneRef = () =>
        cloneElementRef(sharedHelpers, innerCloneRef, { className: 'outer' });

      expect(renderRefMergingCloneRef()).toBe(renderRefMergingCloneRef());
      expect(renderPlainCloneRef()).toBe(renderPlainCloneRef());
    });

    it('should let a plain clone of a ref-merging clone replace its handlers per prop', () => {
      const sharedHelpers = loadSharedHelpers();
      const element = new EventTarget();
      const calls: string[] = [];

      const jsxRef = sharedHelpers.makeEventRef(
        { onClick: recordCall(calls, 'jsx') },
        null,
        'jsx',
      );
      const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
        onClick: recordCall(calls, 'inner'),
        onKeyDown: recordCall(calls, 'inner keydown'),
      });
      const refMergingCloneRef = cloneElementRefWithMergedRef(
        sharedHelpers,
        innerCloneRef,
        { onClick: recordCall(calls, 'ref merging') },
      );
      cloneElementRef(sharedHelpers, refMergingCloneRef, {
        onClick: recordCall(calls, 'outer'),
      })(element);
      dispatchSyntheticLikeEvents(element, ['click', 'keydown']);

      expect(calls).toEqual(['jsx', 'outer', 'inner keydown']);
    });

    it('should replace the inner clone handlers per prop when the outer clone replaces the element ref without calling it', () => {
      const sharedHelpers = loadSharedHelpers();
      const element = new EventTarget();
      const objectRef = { current: null as EventTarget | null };
      const calls: string[] = [];

      const jsxRef = sharedHelpers.makeEventRef(
        { onClick: recordCall(calls, 'jsx') },
        null,
        'jsx',
      );
      const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
        onClick: recordCall(calls, 'inner'),
        onKeyDown: recordCall(calls, 'inner keydown'),
      });
      cloneElementRef(sharedHelpers, innerCloneRef, {
        onClick: recordCall(calls, 'outer'),
        ref: objectRef,
      })(element);
      dispatchSyntheticLikeEvents(element, ['click', 'keydown']);

      expect(calls).toEqual(['outer', 'inner keydown']);
      expect(objectRef.current).toBe(element);
    });

    it.each([
      { outerCloneDescription: 'a plain clone', outerCloneRefConfig: {} },
      {
        outerCloneDescription: 'a clone replacing the ref again',
        outerCloneRefConfig: { ref: { current: null } },
      },
    ])(
      'should keep the inner clone handlers a ref-replacing clone replaced when $outerCloneDescription wraps it',
      ({ outerCloneRefConfig }) => {
        const sharedHelpers = loadSharedHelpers();
        const element = new EventTarget();
        const calls: string[] = [];

        const jsxRef = sharedHelpers.makeEventRef(
          { onClick: recordCall(calls, 'jsx') },
          null,
          'jsx',
        );
        const innerCloneRef = cloneElementRef(sharedHelpers, jsxRef, {
          onClick: recordCall(calls, 'inner'),
          onKeyDown: recordCall(calls, 'inner keydown'),
        });
        const refReplacingCloneRef = cloneElementRef(
          sharedHelpers,
          innerCloneRef,
          { onClick: recordCall(calls, 'middle'), ref: { current: null } },
        );
        cloneElementRef(sharedHelpers, refReplacingCloneRef, {
          onFocus: recordCall(calls, 'outer focus'),
          ...outerCloneRefConfig,
        })(element);
        dispatchSyntheticLikeEvents(element, ['click', 'keydown', 'focus']);

        expect(calls).toEqual(['middle', 'inner keydown', 'outer focus']);
      },
    );
  });
});
