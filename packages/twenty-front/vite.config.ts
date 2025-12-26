/* eslint-disable no-console */
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
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
type Checkers = Parameters<typeof checker>[0];

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, '');

  const {
    REACT_APP_SERVER_BASE_URL,
    VITE_BUILD_SOURCEMAP,
    VITE_DISABLE_TYPESCRIPT_CHECKER,
    VITE_HOST,
    SSL_CERT_PATH,
    SSL_KEY_PATH,
    REACT_APP_PORT,
    IS_DEBUG_MODE,
  } = env;

  const port = isNonEmptyString(REACT_APP_PORT)
    ? parseInt(REACT_APP_PORT)
    : 3001;

  const isBuildCommand = command === 'build';

  const tsConfigPath = isBuildCommand
    ? path.resolve(__dirname, './tsconfig.build.json')
    : path.resolve(__dirname, './tsconfig.dev.json');

  const CHUNK_SIZE_WARNING_LIMIT = 1024 * 1024; // 1MB
  // Please don't increase this limit for main index chunk
  // If it gets too big then find modules in the code base
  // that can be loaded lazily, there are more!
  const MAIN_CHUNK_SIZE_LIMIT = 6.5 * 1024 * 1024; // 6.5MB for main index chunk
  const OTHER_CHUNK_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB for other chunks

  const checkers: Checkers = {
    overlay: false,
  };

  if (VITE_DISABLE_TYPESCRIPT_CHECKER === 'true') {
    console.log(
      `VITE_DISABLE_TYPESCRIPT_CHECKER: ${VITE_DISABLE_TYPESCRIPT_CHECKER}`,
    );
  }

  if (VITE_BUILD_SOURCEMAP === 'true') {
    console.log(`VITE_BUILD_SOURCEMAP: ${VITE_BUILD_SOURCEMAP}`);
  }

  if (VITE_DISABLE_TYPESCRIPT_CHECKER !== 'true') {
    checkers['typescript'] = {
      tsconfigPath: tsConfigPath,
    };
  }

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/packages/twenty-front',

    server: {
      port: port,
      ...(VITE_HOST ? { host: VITE_HOST } : {}),
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

    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        plugins: [['@lingui/swc-plugin', {}]],
      }),
      tsconfigPaths({
        root: __dirname,
        projects: ['tsconfig.json'],
      }),
      svgr(),
      lingui({
        configPath: path.resolve(__dirname, './lingui.config.ts'),
      }),
      checker(checkers),
      {
        ...wyw({
          include: [
            '**/CurrencyDisplay.tsx',
            '**/EllipsisDisplay.tsx',
            '**/ContactLink.tsx',
            '**/BooleanDisplay.tsx',
            '**/LinksDisplay.tsx',
            '**/RoundedLink.tsx',
            '**/OverflowingTextWithTooltip.tsx',
            '**/Chip.tsx',
            '**/Tag.tsx',
            '**/MultiSelectFieldDisplay.tsx',
            '**/RatingInput.tsx',
            '**/RecordTableCellContainer.tsx',
            '**/RecordTableCellDisplayContainer.tsx',
            '**/Avatar.tsx',
            '**/RecordTableBodyDroppable.tsx',
            '**/RecordTableCellBaseContainer.tsx',
            '**/RecordTableCellTd.tsx',
            '**/RecordTableCellStyleWrapper.tsx',
            '**/RecordTableHeaderDragDropColumn.tsx',
            '**/ActorDisplay.tsx',
            '**/BooleanDisplay.tsx',
            '**/CurrencyDisplay.tsx',
            '**/TextDisplay.tsx',
            '**/EllipsisDisplay.tsx',
            '**/AvatarChip.tsx',
            '**/URLDisplay.tsx',
            '**/EmailsDisplay.tsx',
            '**/PhonesDisplay.tsx',
            '**/MultiSelectDisplay.tsx',
            '**/RecordTableRowVirtualizedContainer.tsx',
            '**/RecordTableVirtualizedBodyPlaceholder.tsx',
            '**/RecordTableCellLoading.tsx',
          ],
          babelOptions: {
            presets: ['@babel/preset-typescript', '@babel/preset-react'],
          },
        }),
        enforce: 'pre',
      },
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }) as PluginOption, // https://github.com/btd/rollup-plugin-visualizer/issues/162#issuecomment-1538265997,
    ],

    optimizeDeps: {
      exclude: [
        '../../node_modules/.vite',
        '../../node_modules/.cache',
        '../../node_modules/twenty-ui',
      ],
    },

    build: {
      minify: 'esbuild',
      outDir: 'build',
      sourcemap: VITE_BUILD_SOURCEMAP === 'true',
      rollupOptions: {
        //  Don't use manual chunks as it causes many issue
        // including this one we wasted a lot of time on:
        // https://github.com/rollup/rollup/issues/2793
        output: {
          // Set chunk size warning limit (in bytes) - warns at 1MB
          chunkSizeWarningLimit: CHUNK_SIZE_WARNING_LIMIT,
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
      _env_: {
        REACT_APP_SERVER_BASE_URL,
      },
      'process.env': {
        REACT_APP_SERVER_BASE_URL,
        IS_DEBUG_MODE,
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    resolve: {
      alias: {
        path: 'rollup-plugin-node-polyfills/polyfills/path',
        // https://github.com/twentyhq/twenty/pull/10782/files
        // This will likely be migrated to twenty-ui package when built separately
        '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      },
    },
  };
});
