import type * as esbuild from 'esbuild';

export const FRONT_COMPONENT_ROUTER_PROVIDER_SPECIFIER =
  '__front_component_router_provider__';

// twenty-ui components (RawLink, LinkChip, UndecoratedLink, ...) rely on
// react-router and crash when rendered outside a <Router>. The sandbox worker
// has no browser history, so the component tree is wrapped in a low-level
// Router whose navigator forwards push/replace to the host navigate API: links
// both render and genuinely navigate the host app through the sanctioned
// front-component host API.
const ROUTER_PROVIDER_MODULE = `
import { createElement } from 'react';
import { Router } from 'react-router-dom';
import { navigate as __hostNavigate } from 'twenty-sdk/front-component';

const toHref = (to) => {
  if (typeof to === 'string') {
    return to;
  }

  const { pathname = '/', search = '', hash = '' } = to ?? {};

  return pathname + search + hash;
};

const forwardToHostNavigate = (to) => {
  try {
    const result = __hostNavigate(toHref(to));

    if (result && typeof result.catch === 'function') {
      result.catch(() => {});
    }
  } catch {
    // The host communication API is not initialized (e.g. headless render):
    // navigation is a no-op rather than a crash.
  }
};

const hostNavigator = {
  createHref: toHref,
  push: forwardToHostNavigate,
  replace: forwardToHostNavigate,
  go: () => {},
};

export function FrontComponentRouterProvider(props) {
  return createElement(
    Router,
    { location: { pathname: '/' }, navigator: hostNavigator },
    props.children,
  );
}
`.trim();

// Fallback when the application dependency tree does not provide
// react-router-dom: render the component tree as-is.
const ROUTER_PROVIDER_FALLBACK_MODULE = `
export function FrontComponentRouterProvider(props) {
  return props.children;
}
`.trim();

export const frontComponentRouterProviderPlugin: esbuild.Plugin = {
  name: 'front-component-router-provider',
  setup: (build) => {
    build.onResolve(
      { filter: new RegExp(`^${FRONT_COMPONENT_ROUTER_PROVIDER_SPECIFIER}$`) },
      (args) => ({
        path: FRONT_COMPONENT_ROUTER_PROVIDER_SPECIFIER,
        namespace: 'front-component-router-provider',
        pluginData: { resolveDir: args.resolveDir },
      }),
    );

    build.onLoad(
      { filter: /.*/, namespace: 'front-component-router-provider' },
      async (args) => {
        const resolveDir: string = args.pluginData?.resolveDir ?? '';

        const resolved = await build.resolve('react-router-dom', {
          kind: 'import-statement',
          resolveDir,
        });

        const isReactRouterAvailable =
          resolved.errors.length === 0 && resolved.path !== '';

        return {
          contents: isReactRouterAvailable
            ? ROUTER_PROVIDER_MODULE
            : ROUTER_PROVIDER_FALLBACK_MODULE,
          loader: 'js' as const,
          resolveDir,
        };
      },
    );
  },
};
