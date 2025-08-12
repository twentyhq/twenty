// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

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
