// React 19's @types/react removed the global `JSX` namespace (it now lives under
// `React.JSX`). A number of our dependencies' published typings still reference the
// global namespace — most importantly `@linaria/react`'s `styled.d.ts`, which types
// every `styled.<tag>` via `keyof JSX.IntrinsicElements`. Without a global `JSX`,
// those degrade to `any`, cascading into implicit-any errors across every styled
// component. This shim re-exposes the global `JSX` namespace as an alias of
// `React.JSX` for the duration of the React 19 transition.
//
// Drop this once @linaria/react (and any other offenders) publish typings that use
// `React.JSX` instead of the global namespace.
import type * as React from 'react';

declare global {
  namespace JSX {
    type ElementType = React.JSX.ElementType;
    interface Element extends React.JSX.Element {}
    interface ElementClass extends React.JSX.ElementClass {}
    interface ElementAttributesProperty
      extends React.JSX.ElementAttributesProperty {}
    interface ElementChildrenAttribute
      extends React.JSX.ElementChildrenAttribute {}
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
    interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
    interface IntrinsicClassAttributes<T>
      extends React.JSX.IntrinsicClassAttributes<T> {}
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}
