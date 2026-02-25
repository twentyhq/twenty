// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import {
  ReadableStream as NodeReadableStream,
  TransformStream as NodeTransformStream,
  WritableStream as NodeWritableStream,
} from 'node:stream/web';

import { i18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { messages as enMessages } from '~/locales/generated/en';

// Initialize i18n for all tests
i18n.load({ [SOURCE_LOCALE]: enMessages });
i18n.activate(SOURCE_LOCALE);

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

// Add Jest matchers for toThrowError and other missing methods
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

/**
 * The structuredClone global function is not available in jsdom, it needs to be mocked for now.
 *
 * The most naive way to mock structuredClone is to use JSON.stringify and JSON.parse. This works
 * for arguments with simple types like primitives, arrays and objects, but doesn't work with functions,
 * Map, Set, etc.
 */
global.structuredClone = (val) => {
  return JSON.parse(JSON.stringify(val));
};
