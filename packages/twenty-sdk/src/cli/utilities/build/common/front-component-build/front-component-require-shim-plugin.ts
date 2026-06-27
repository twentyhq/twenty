import { dirname } from 'path';

import type * as esbuild from 'esbuild';

// Front components run as ESM in a remote-dom web worker that has no `require`.
// Some transitive CJS/UMD dependencies reach React through a require captured at
// their own build time (e.g. `var React = require("react")` frozen into a webpack
// UMD bundle, or use-sync-external-store's shim). When twenty-ui / twenty-sdk
// bundle those deps with React externalized, that require survives as an opaque
// captured call (`ps("react")`) that esbuild cannot rewrite to Preact, because it
// is not a literal import record. At render time it falls through to esbuild's
// `__require` helper, which throws: `Dynamic require of "react" is not supported`.
//
// The react -> preact aliasing plugins only catch literal `import`/`require`
// records, so they cannot reach those captured calls. This plugin closes the gap
// at runtime: it injects a prelude that defines `globalThis.require`, mapping the
// React module ids to the SAME bundled Preact the rest of the component uses. The
// prelude imports those ids through the bare specifiers, so they flow through the
// existing wrapper/alias plugins (one Preact copy). esbuild's `__require` re-reads
// `typeof require` at call time, so once `globalThis.require` exists the captured
// calls resolve to Preact instead of throwing.
const SHIM_NAMESPACE = 'front-component-require-shim';
const SHIM_ENTRY_PATH = '\0front-component-require-shim';

// The prelude runs at module-init (top-level), before any component render, so it
// is installed before the lazy __commonJS factories that hold the captured calls
// are ever evaluated. `react/jsx-dev-runtime` is mapped to the production runtime;
// the build forces NODE_ENV=production, so jsxDEV is never reached.
const SHIM_PRELUDE = `
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as ReactDomClient from 'react-dom/client';
import * as ReactJsxRuntime from 'react/jsx-runtime';

var __frontComponentReactModules = {
  'react': React,
  'react-dom': ReactDom,
  'react-dom/client': ReactDomClient,
  'react/jsx-runtime': ReactJsxRuntime,
  'react/jsx-dev-runtime': ReactJsxRuntime,
};

if (typeof globalThis.require === 'undefined') {
  globalThis.require = function frontComponentRequire(moduleId) {
    if (Object.prototype.hasOwnProperty.call(__frontComponentReactModules, moduleId)) {
      return __frontComponentReactModules[moduleId];
    }
    throw new Error(
      'Front component require shim: dynamic require of "' +
        moduleId +
        '" is not supported in the worker sandbox',
    );
  };
}
`.trim();

// Resolve a directory from which `preact/*` is resolvable. The prelude's bare
// React imports are re-resolved by the wrapper/alias plugins relative to this
// directory, so it must sit inside the dependency tree (the app entry's folder
// always walks up to a node_modules that provides Preact via twenty-sdk).
const getResolveDirectory = (
  buildOptions: esbuild.BuildOptions,
): string | undefined => {
  const { absWorkingDir, entryPoints } = buildOptions;

  const firstEntryPoint = Array.isArray(entryPoints)
    ? entryPoints[0]
    : entryPoints !== undefined
      ? Object.values(entryPoints)[0]
      : undefined;

  const entryPath =
    typeof firstEntryPoint === 'string'
      ? firstEntryPoint
      : firstEntryPoint?.in;

  if (entryPath !== undefined) {
    return dirname(entryPath);
  }

  return absWorkingDir;
};

export const createFrontComponentRequireShimPlugin = (): esbuild.Plugin => ({
  name: SHIM_NAMESPACE,
  setup: (build) => {
    const resolveDirectory = getResolveDirectory(build.initialOptions);

    build.initialOptions.inject = [
      ...(build.initialOptions.inject ?? []),
      SHIM_ENTRY_PATH,
    ];

    build.onResolve({ filter: /^\0front-component-require-shim$/ }, () => ({
      path: SHIM_ENTRY_PATH,
      namespace: SHIM_NAMESPACE,
    }));

    build.onLoad({ filter: /.*/, namespace: SHIM_NAMESPACE }, () => ({
      contents: SHIM_PRELUDE,
      loader: 'js' as const,
      resolveDir: resolveDirectory,
    }));
  },
});
