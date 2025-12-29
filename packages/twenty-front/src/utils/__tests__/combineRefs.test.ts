import { type MutableRefObject } from 'react';
import { combineRefs } from '~/utils/combineRefs';

describe('combineRefs', () => {
  it('should handle function refs', () => {
    const ref1 = jest.fn();
    const ref2 = jest.fn();
    const node = document.createElement('div');

    const combinedRef = combineRefs(ref1, ref2);
    combinedRef(node);

    expect(ref1).toHaveBeenCalledWith(node);
    expect(ref2).toHaveBeenCalledWith(node);
  });

  it('should handle object refs', () => {
    const ref1: MutableRefObject<HTMLDivElement | null> = { current: null };
    const ref2: MutableRefObject<HTMLDivElement | null> = { current: null };
    const node = document.createElement('div');

    const combinedRef = combineRefs(ref1, ref2);
    combinedRef(node);

    expect(ref1.current).toBe(node);
    expect(ref2.current).toBe(node);
  });

  it('should handle mixed function and object refs', () => {
    const funcRef = jest.fn();
    const objRef: MutableRefObject<HTMLDivElement | null> = { current: null };
    const node = document.createElement('div');

    const combinedRef = combineRefs(funcRef, objRef);
    combinedRef(node);

    expect(funcRef).toHaveBeenCalledWith(node);
    expect(objRef.current).toBe(node);
  });

  it('should handle undefined refs', () => {
    const ref1 = jest.fn();
    const node = document.createElement('div');

    const combinedRef = combineRefs(ref1, undefined);
    combinedRef(node);

    expect(ref1).toHaveBeenCalledWith(node);
  });

  it('should handle all undefined refs', () => {
    const node = document.createElement('div');

    const combinedRef = combineRefs(undefined, undefined);

    expect(() => combinedRef(node)).not.toThrow();
  });

  it('should handle empty refs array', () => {
    const node = document.createElement('div');

    const combinedRef = combineRefs();

    expect(() => combinedRef(node)).not.toThrow();
  });

  it('should handle null refs', () => {
    const ref1 = jest.fn();
    const node = document.createElement('div');

    const combinedRef = combineRefs(ref1, null);
    combinedRef(node);

    expect(ref1).toHaveBeenCalledWith(node);
  });
});
