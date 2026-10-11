declare module '__real_react__' {
  type ElementFactory = (...elementArguments: unknown[]) => unknown;

  const React: {
    createElement: ElementFactory;
    cloneElement: ElementFactory;
  };

  export default React;
}

declare module '__real_react_jsx_runtime__' {
  type JsxFactory = (type: unknown, props: unknown, key?: unknown) => unknown;

  export const jsx: JsxFactory;
  export const jsxs: JsxFactory;
  export const Fragment: unknown;
}

declare module '__jsx_shared_helpers__' {
  export * from '@/cli/utilities/build/common/front-component-build/jsx-runtime/jsx-shared-helpers';
}

declare module '__reads_element_ref_from_vnode__' {
  export const READS_ELEMENT_REF_FROM_VNODE: boolean;
}
