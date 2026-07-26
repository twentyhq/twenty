import { lingui } from '@lingui/vite-plugin';
import { isNonEmptyString } from '@sniptt/guards';
import react from '@vitejs/plugin-react-swc';
import wyw from '@wyw-in-js/vite';
import fs from 'fs';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import {
  defineConfig,
  loadEnv,
  type PluginOption,
  searchForWorkspaceRoot,
} from 'vite';
import svgr from 'vite-plugin-svgr';

import { createWywProfilingPlugin } from 'twenty-shared/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  const {
    VITE_BUILD_SOURCEMAP,
    VITE_HOST,
    VITE_ALLOWED_HOSTS,
    VITE_PROXY_API_TO,
    SSL_CERT_PATH,
    SSL_KEY_PATH,
    REACT_APP_PORT,
    IS_DEBUG_MODE,
    REACT_APP_ENVIRONMENT_LABEL,
  } = env;

  const port = isNonEmptyString(REACT_APP_PORT)
    ? parseInt(REACT_APP_PORT)
    : 3001;

  // When VITE_PROXY_API_TO is set, the dev server forwards backend routes to it
  // so the frontend and API share a single origin (needed to expose dev through
  // one tunnel, and for clean OAuth callbacks). Prefixes are the backend's
  // controller/GraphQL routes; everything else falls through to Vite (the SPA).
  // Regex keys avoid collisions with frontend routes that share a prefix:
  // `^/auth(/|$)` excludes the SPA's `/authorize`, and `^/s/` excludes `/sync`
  // and `/settings`.
  const buildApiProxy = (target: string) => {
    const prefixes = [
      '/metadata',
      '/admin-panel',
      '/client-config',
      '/rest',
      '/oauth',
      '/apps',
      '/app/billing',
      '/webhooks',
      '/healthz',
      '/mcp',
      '/files',
      '/file',
      '/public-assets',
      '/.well-known',
    ];
    const proxy: Record<
      string,
      { target: string; changeOrigin: boolean; ws?: boolean }
    > = {
      '/graphql': { target, changeOrigin: true, ws: true },
      '^/auth(/|$)': { target, changeOrigin: true },
      '^/s/': { target, changeOrigin: true },
    };
    for (const prefix of prefixes) {
      proxy[prefix] = { target, changeOrigin: true };
    }
    return proxy;
  };

  const CHUNK_SIZE_WARNING_LIMIT = 1024 * 1024; // 1MB
  // Please don't increase this limit for main index chunk
  // If it gets too big then find modules in the code base
  // that can be loaded lazily, there are more!
  const MAIN_CHUNK_SIZE_LIMIT = 6.8 * 1024 * 1024; // 6.8MB for main index chunk
  const OTHER_CHUNK_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB for other chunks

  if (VITE_BUILD_SOURCEMAP === 'true') {
    // oxlint-disable-next-line no-console
    console.log(`VITE_BUILD_SOURCEMAP: ${VITE_BUILD_SOURCEMAP}`);
  }

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-front',

    server: {
      port: port,
      ...(VITE_HOST ? { host: VITE_HOST } : {}),
      // Comma-separated hostnames allowed to reach the dev server (e.g. when
      // proxied through a tunnel/reverse proxy). Use "true" to allow any host.
      ...(isNonEmptyString(VITE_ALLOWED_HOSTS)
        ? {
            allowedHosts:
              VITE_ALLOWED_HOSTS === 'true'
                ? true
                : VITE_ALLOWED_HOSTS.split(',').map((host) => host.trim()),
          }
        : {}),
      ...(isNonEmptyString(VITE_PROXY_API_TO)
        ? { proxy: buildApiProxy(VITE_PROXY_API_TO) }
        : {}),
      ...(SSL_KEY_PATH && SSL_CERT_PATH
        ? {
            protocol: 'https',
            https: {
              key: fs.readFileSync(env.SSL_KEY_PATH),
              cert: fs.readFileSync(env.SSL_CERT_PATH),
            },
          }
        : {
            protocol: 'http',
          }),
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          '**/@blocknote/core/src/fonts/**',
        ],
      },
    },

    // `vite preview` serves the production build (bundled -> few requests, so it
    // streams cleanly over a tunnel, unlike dev mode's ~1900 module requests).
    // Runs on its own port so the public/tunnelled build and a local dev server
    // can coexist, both proxying the API to the same backend.
    preview: {
      port: isNonEmptyString(env.VITE_PREVIEW_PORT)
        ? parseInt(env.VITE_PREVIEW_PORT)
        : 3010,
      ...(VITE_HOST ? { host: VITE_HOST } : {}),
      ...(isNonEmptyString(VITE_ALLOWED_HOSTS)
        ? {
            allowedHosts:
              VITE_ALLOWED_HOSTS === 'true'
                ? true
                : VITE_ALLOWED_HOSTS.split(',').map((host) => host.trim()),
          }
        : {}),
      ...(isNonEmptyString(VITE_PROXY_API_TO)
        ? { proxy: buildApiProxy(VITE_PROXY_API_TO) }
        : {}),
    },

    plugins: [
      // In dev, Vite serves index.html with an empty window._env_ placeholder
      // (it is only populated by the server/inject script in prod). When the
      // app is reached via a non-localhost host (e.g. a tunnel), getDefaultUrl()
      // would resolve the API to the same origin and 404. Inject the configured
      // server base URL so the frontend hits the right backend.
      {
        name: 'inject-runtime-env-dev',
        transformIndexHtml(html: string) {
          const runtimeEnv = {
            ...(isNonEmptyString(env.REACT_APP_SERVER_BASE_URL)
              ? { REACT_APP_SERVER_BASE_URL: env.REACT_APP_SERVER_BASE_URL }
              : {}),
            ...(isNonEmptyString(REACT_APP_ENVIRONMENT_LABEL)
              ? { REACT_APP_ENVIRONMENT_LABEL }
              : {}),
          };

          if (Object.keys(runtimeEnv).length === 0) {
            return html;
          }

          return html.replace(
            /<script id="twenty-env-config">[\s\S]*?<\/script>/,
            `<script id="twenty-env-config">window._env_ = ${JSON.stringify(runtimeEnv)};</script>`,
          );
        },
      },
      react({
        plugins: [['@lingui/swc-plugin', {}]],
      }),
      svgr(),
      lingui({
        configPath: path.resolve(__dirname, './lingui.config.ts'),
      }),
      createWywProfilingPlugin(
        wyw({
          include: [path.resolve(__dirname, 'src') + '/**/*.{ts,tsx}'],
          exclude: [
            '**/generated-metadata/**',
            '**/generated-admin/**',
            '**/testing/mock-data/**',
            '**/testing/jest/**',
            '**/testing/hooks/**',
            '**/testing/utils/**',
            '**/testing/constants/**',
            '**/testing/cache/**',
            '**/*.test.{ts,tsx}',
            '**/*.spec.{ts,tsx}',
            '**/__tests__/**',
            '**/__mocks__/**',
            '**/types/**',
            '**/constants/**',
            '**/states/**',
            '**/selectors/**',
            '**/guards/**',
            '**/schemas/**',
            '**/utils/**',
            '**/contexts/**',
            '**/hooks/**',
            '**/enums/**',
            '**/queries/**',
            '**/mutations/**',
            '**/fragments/**',
            '**/graphql/**',
            '**/decorators/**',
          ],
          babelOptions: {
            presets: ['@babel/preset-typescript', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-export-namespace-from'],
          },
        }),
      ),
      ...(env.ANALYZE === 'true'
        ? [
            visualizer({
              open: !process.env.CI,
              gzipSize: true,
              brotliSize: true,
              filename: 'dist/stats.html',
            }) as PluginOption,
          ]
        : []),
    ],

    optimizeDeps: {
      exclude: [
        '../../node_modules/.vite',
        '../../node_modules/.cache',
        '../../node_modules/twenty-ui',
      ],
      // Pre-bundle React and the heavy libraries reached through lazy() chains
      // (charts, rich-text editors). Otherwise a lazy story (e.g. a graph widget)
      // makes Vite discover the dep mid-render, triggering a re-optimize + page
      // reload that 404s every in-flight story import in browser-mode Storybook
      // tests (vite 8 / rolldown).
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@nivo/core',
        '@nivo/pie',
        '@nivo/line',
        '@nivo/arcs',
        '@react-spring/web',
        'd3-shape',
      ],
    },

    build: {
      minify: 'esbuild',
      outDir: 'build',
      sourcemap: VITE_BUILD_SOURCEMAP === 'true' ? 'hidden' : false,
      chunkSizeWarningLimit: CHUNK_SIZE_WARNING_LIMIT,
      rollupOptions: {
        //  Don't use manual chunks as it causes many issue
        // including this one we wasted a lot of time on:
        // https://github.com/rollup/rollup/issues/2793
        output: {
          // Custom plugin to fail build if chunks exceed max size
          plugins: [
            {
              name: 'chunk-size-limit',
              generateBundle(_options, bundle) {
                const oversizedChunks: string[] = [];

                Object.entries(bundle).forEach(([fileName, chunk]) => {
                  if (chunk.type === 'chunk' && chunk.code !== undefined) {
                    const size = Buffer.byteLength(chunk.code, 'utf8');
                    const isMainChunk =
                      fileName.includes('index') && chunk.isEntry;
                    const sizeLimit = isMainChunk
                      ? MAIN_CHUNK_SIZE_LIMIT
                      : OTHER_CHUNK_SIZE_LIMIT;
                    const limitType = isMainChunk ? 'main' : 'other';

                    if (size > sizeLimit) {
                      oversizedChunks.push(
                        `${fileName} (${limitType}): ${(size / 1024 / 1024).toFixed(2)}MB (limit: ${(sizeLimit / 1024 / 1024).toFixed(2)}MB)`,
                      );
                    }
                  }
                });

                if (oversizedChunks.length > 0) {
                  const errorMessage = `Build failed: The following chunks exceed their size limits:\n${oversizedChunks.map((chunk) => `  - ${chunk}`).join('\n')}`;
                  this.error(errorMessage);
                }
              },
            },
            // TODO; later - think about prefetching modules such
            // as date time picker, phone input etc...
            /*
            {
              name: 'add-prefetched-modules',
              transformIndexHtml(html: string,
                ctx: {
                  path: string;
                  filename: string;
                  server?: ViteDevServer;
                  bundle?: import('rollup').OutputBundle;
                  chunk?: import('rollup').OutputChunk;
                }) {

                  const bundles = Object.keys(ctx.bundle ?? {});

                  let modernBundles = bundles.filter(
                    (bundle) => bundle.endsWith('.map') === false
                  );


                  // Remove existing files and concatenate them into link tags
                  const prefechBundlesString = modernBundles
                    .filter((bundle) => html.includes(bundle) === false)
                    .map((bundle) => `<link rel="prefetch" href="${ctx.server?.config.base}${bundle}">`)
                    .join('');

                  // Use regular expression to get the content within <head> </head>
                  const headContent = html.match(/<head>([\s\S]*)<\/head>/)?.[1] ?? '';
                  // Insert the content of prefetch into the head
                  const newHeadContent = `${headContent}${prefechBundlesString}`;
                  // Replace the original head
                  html = html.replace(
                    /<head>([\s\S]*)<\/head>/,
                    `<head>${newHeadContent}</head>`
                  );

                  return html;


              },
            }*/
          ],
        },
      },
    },

    envPrefix: 'REACT_APP_',

    define: {
      'process.env': {
        IS_DEBUG_MODE,
        IS_DEV_ENV: mode === 'development' ? 'true' : 'false',
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    resolve: {
      tsconfigPaths: true,
      alias: [
        // wyw-in-js 1.x resolves modules in its CSS evaluator via vite's
        // resolve.alias (not resolve.tsconfigPaths), so the `@/` and `~/`
        // tsconfig path aliases must be mirrored here.
        {
          find: /^@\//,
          replacement: path.resolve(__dirname, 'src/modules') + '/',
        },
        { find: /^~\//, replacement: path.resolve(__dirname, 'src') + '/' },
        {
          find: 'path',
          replacement: 'rollup-plugin-node-polyfills/polyfills/path',
        },
      ],
    },
  };
});
