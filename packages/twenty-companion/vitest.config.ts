import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      deps: {
        optimizer: { client: { enabled: true, include: ['react-responsive'] } },
      },
      server: {
        // Shared UI dependencies must use the same React instance as the renderer.
        deps: { inline: [/@base-ui\//, /@floating-ui\//, /react-responsive/] },
      },
    },
  }),
);
