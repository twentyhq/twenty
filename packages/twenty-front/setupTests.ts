import '@testing-library/jest-dom';
import {
  ReadableStream as NodeReadableStream,
  TransformStream as NodeTransformStream,
  WritableStream as NodeWritableStream,
} from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';

import { i18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { messages as enMessages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: enMessages });
i18n.activate(SOURCE_LOCALE);

// jsdom lacks TextEncoder/TextDecoder, which @ai-sdk/provider-utils builds at import.
if (globalThis.TextDecoder === undefined) {
  Object.assign(globalThis, { TextDecoder, TextEncoder });
}

const globalWithWebStreams = globalThis as Record<string, unknown>;

if (globalWithWebStreams.TransformStream === undefined) {
  globalWithWebStreams.TransformStream = NodeTransformStream;
}

if (globalWithWebStreams.ReadableStream === undefined) {
  globalWithWebStreams.ReadableStream = NodeReadableStream;
}

if (globalWithWebStreams.WritableStream === undefined) {
  globalWithWebStreams.WritableStream = NodeWritableStream;
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', {
    value: () => {},
    writable: true,
  });
}

// jsdom lacks ResizeObserver, which @dnd-kit/dom expects at import time.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (globalThis.ResizeObserver === undefined) {
  globalThis.ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toThrowError(error?: string | RegExp | Error): R;
      toMatchSnapshot(propertyMatchers?: any): R;
    }
  }

  namespace Vi {
    interface Assertion {
      toMatchSnapshot(propertyMatchers?: any): void;
    }
  }
}

// jsdom has no structuredClone; this JSON round-trip drops functions, Map, Set, etc.
global.structuredClone = (val) => {
  return JSON.parse(JSON.stringify(val));
};
