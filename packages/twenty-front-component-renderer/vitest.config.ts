// Re-exported so @storybook/addon-vitest's in-UI "Run tests" button (which
// only discovers vitest.config.* / vite.config.* files) finds the storybookTest
// project. CLI runs keep passing --config vitest.storybook.config.ts.
export { default } from './vitest.storybook.config';
