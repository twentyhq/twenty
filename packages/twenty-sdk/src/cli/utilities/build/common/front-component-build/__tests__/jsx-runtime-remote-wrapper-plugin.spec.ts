import { runInNewContext } from 'node:vm';
import * as esbuild from 'esbuild';

import { createJsxRuntimeRemoteWrapperPlugin } from '@/cli/utilities/build/common/front-component-build/jsx-runtime-remote-wrapper-plugin';

const runWrappedExample = async (contents: string): Promise<unknown> => {
  const bundle = await esbuild.build({
    stdin: {
      contents,
      loader: 'tsx',
      resolveDir: process.cwd(),
    },
    bundle: true,
    write: false,
    format: 'iife',
    globalName: 'wrappedExample',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [createJsxRuntimeRemoteWrapperPlugin()],
  });
  const sandbox: {
    __HTML_TAG_TO_CUSTOM_ELEMENT_TAG__: Record<string, string>;
    wrappedExample?: { result: unknown };
  } = {
    __HTML_TAG_TO_CUSTOM_ELEMENT_TAG__: { span: 'html-span' },
  };

  runInNewContext(bundle.outputFiles[0].text, sandbox);

  return sandbox.wrappedExample?.result;
};

describe('remote JSX cloning', () => {
  it('binds injected trigger events and preserves refs, keys, props, and children', async () => {
    const result = await runWrappedExample(`
      import React, { cloneElement, createRef } from 'react';
      const events = [];
      const reference = createRef();
      const source = <span id="trigger" key="source" ref={reference} onClick={() => events.push('click')}>Original</span>;
      const cloned = cloneElement(source, {
        key: 'cloned',
        title: 'Help',
        onKeyDown: (event) => events.push(event.key),
      }, 'Replacement');
      const element = {};
      cloned.props.ref(element);
      element.onclick({});
      element.onkeydown({ key: 'Escape' });
      const forwardedRef = reference.current === element;
      cloned.props.ref(null);
      export const result = {
        type: cloned.type,
        id: cloned.props.id,
        title: cloned.props.title,
        key: cloned.key,
        children: cloned.props.children,
        originalChildren: source.props.children,
        events,
        forwardedRef,
        clearedRef: reference.current === null,
        defaultClone: React.cloneElement === cloneElement,
      };
    `);

    expect(result).toEqual({
      type: 'html-span',
      id: 'trigger',
      title: 'Help',
      key: 'cloned',
      children: 'Replacement',
      originalChildren: 'Original',
      events: ['click', 'Escape'],
      forwardedRef: true,
      clearedRef: true,
      defaultClone: true,
    });
  });

  it('overrides and removes events without restoring handlers through merged refs', async () => {
    const result = await runWrappedExample(`
      import { cloneElement, createElement } from 'react';
      const events = [];
      const source = createElement('span', { onKeyDown: () => events.push('original') });
      const mergedRef = (element) => {
        source.props.ref(element);
        if (element) element.onkeydown = () => events.push('external');
      };
      const cloned = cloneElement(source, {
        ref: mergedRef,
        onKeyDown: () => events.push('replacement'),
      });
      const clonedElement = {};
      cloned.props.ref(clonedElement);
      clonedElement.onkeydown({});
      const removed = cloneElement(cloned, { onKeyDown: null });
      const removedElement = {};
      removed.props.ref(removedElement);
      const originalElement = {};
      source.props.ref(originalElement);
      originalElement.onkeydown({});
      export const result = { events, removed: removedElement.onkeydown === null };
    `);

    expect(result).toEqual({
      events: ['replacement', 'original'],
      removed: true,
    });
  });

  it('preserves a replacement callback ref cleanup', async () => {
    const result = await runWrappedExample(`
      import { cloneElement, createElement } from 'react';
      const calls = [];
      const source = createElement('span', {
        ref: () => calls.push('original ref'),
        onKeyDown: () => calls.push('keydown'),
      });
      const cloned = cloneElement(source, {
        ref: () => {
          calls.push('replacement ref');
          return () => calls.push('cleanup');
        },
      });
      const element = {};
      const cleanup = cloned.props.ref(element);
      element.onkeydown({});
      cleanup();
      export const result = calls;
    `);

    expect(result).toEqual(['replacement ref', 'keydown', 'cleanup']);
  });

  it('updates rebound handlers without adding listeners during an event dispatch', async () => {
    const result = await runWrappedExample(`
      import { cloneElement, createElement } from 'react';
      const events = [];
      const listeners = new Set();
      const element = {};
      let currentListener;
      Object.defineProperty(element, 'onkeydown', {
        get() { return currentListener; },
        set(handler) {
          const previousListener = currentListener;
          currentListener = handler && function(event) { return handler.call(this, event); };
          if (currentListener) listeners.add(currentListener);
          if (previousListener) listeners.delete(previousListener);
        },
      });
      const source = createElement('span');
      const replacement = cloneElement(source, {
        onKeyDown() { events.push('replacement'); },
      });
      const original = cloneElement(source, {
        onKeyDown() {
          events.push('original');
          replacement.props.ref(element);
        },
      });
      original.props.ref(element);
      for (const listener of listeners) listener.call(element, {});
      const firstDispatch = [...events];
      for (const listener of listeners) listener.call(element, {});
      export const result = { firstDispatch, events, listenerCount: listeners.size };
    `);

    expect(result).toEqual({
      firstDispatch: ['original'],
      events: ['original', 'replacement'],
      listenerCount: 1,
    });
  });

  it('provides nativeEvent while preserving native methods, receiver, and existing aliases', async () => {
    const result = await runWrappedExample(`
      import { cloneElement, createElement } from 'react';
      const source = createElement('span');
      const element = {};
      const nativeEvent = {
        key: 'Escape',
        currentTarget: element,
        preventDefault() { this.defaultPrevented = true; },
      };
      const cloned = cloneElement(source, {
        onKeyDown(event) {
          event.preventDefault();
          return this === element && event.currentTarget === element && event.key === 'Escape';
        },
      });
      cloned.props.ref(element);
      const returned = element.onkeydown(nativeEvent);
      const existingNativeEvent = {};
      const eventWithAlias = { ...nativeEvent, nativeEvent: existingNativeEvent };
      element.onkeydown(eventWithAlias);
      export const result = {
        returned,
        defaultPrevented: nativeEvent.defaultPrevented,
        aliased: nativeEvent.nativeEvent === nativeEvent,
        preserved: eventWithAlias.nativeEvent === existingNativeEvent,
      };
    `);

    expect(result).toEqual({
      returned: true,
      defaultPrevented: true,
      aliased: true,
      preserved: true,
    });
  });

  it('leaves custom component event props and refs available to the component', async () => {
    const result = await runWrappedExample(`
      import { cloneElement, createElement, createRef } from 'react';
      const Component = () => null;
      const reference = createRef();
      const handler = () => {};
      const source = createElement(Component, { ref: reference, onKeyDown: handler });
      const cloned = cloneElement(source, { title: 'Help' });
      export const result = {
        type: cloned.type === Component,
        ref: cloned.props.ref === reference,
        handler: cloned.props.onKeyDown === handler,
        title: cloned.props.title,
      };
    `);

    expect(result).toEqual({
      type: true,
      ref: true,
      handler: true,
      title: 'Help',
    });
  });
});
