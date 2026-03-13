import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      root: __dirname,
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    name: 'twenty-sdk-integration',
    environment: 'node',
    include: ['src/**/__integration__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.git/**'],
    globals: true,
    diff: {
      truncateThreshold: 0,
    },
    fileParallelism: false,
    env: {
      TWENTY_API_URL: 'http://localhost:3000',
      TWENTY_API_KEY:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC1lNmI1LTQ2ODAtOGEzMi1iODIwOTczNzE1NmIiLCJ1c2VySWQiOiIyMDIwMjAyMC1lNmI1LTQ2ODAtOGEzMi1iODIwOTczNzE1NmIiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtNDYzZi00MzViLTgyOGMtMTA3ZTAwN2EyNzExIiwidXNlcldvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWU3Yy00M2Q5LWE1ZGItNjg1YjUwNjlkODE2IiwidHlwZSI6IkFDQ0VTUyIsImF1dGhQcm92aWRlciI6InBhc3N3b3JkIiwiaWF0IjoxNzUxMjgxNzA0LCJleHAiOjIwNjY4NTc3MDR9.HMGqCsVlOAPVUBhKSGlD1X86VoHKt4LIUtET3CGIdik',
    },
    setupFiles: [
      'src/cli/__tests__/constants/setupTest.ts',
      'src/cli/__tests__/integration/utils/setup-app-dev-mocks.ts',
    ],
  },
});
