// React 19's @types/react removed the global `JSX` namespace (it now lives under
// `React.JSX`). Our own code still references the global namespace in ~25 files
// (`JSX.Element`, `keyof JSX.IntrinsicElements`, ...), so this shim re-exposes the
// global `JSX` namespace as an alias of `React.JSX` for the React 19 transition.
//
// (@linaria/react — historically the other offender, via a `styled.d.ts` that typed
// every `styled.<tag>` through `keyof JSX.IntrinsicElements` — is now on v7, which
// targets `React.JSX` directly and self-provides its own shim, so it no longer
// relies on this.)
//
// Drop this once our own code is migrated to a module-scoped `import { type JSX }
// from 'react'` (or `React.JSX`). That is a separate mechanical pass: the repo
// enforces no-duplicate-imports, so the JSX import must be merged into each file's
// existing `react` import — best done with `types-react-codemod scoped-jsx`.
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
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<
      C,
      P
    >;
    interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
    interface IntrinsicClassAttributes<T> extends React.JSX
      .IntrinsicClassAttributes<T> {}
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}
