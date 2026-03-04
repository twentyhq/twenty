import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.spec.json'],
      ignoreConfigErrors: true,
    }),
  ],
  test: {
    testTimeout: 120_000,
    hookTimeout: 120_000,
    include: ['src/**/*.integration-test.ts'],
    setupFiles: ['src/__tests__/setup-test.ts'],
    env: {
      TWENTY_API_URL: 'http://localhost:3000',
      TWENTY_TEST_API_KEY:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC1lNmI1LTQ2ODAtOGEzMi1iODIwOTczNzE1NmIiLCJ1c2VySWQiOiIyMDIwMjAyMC1lNmI1LTQ2ODAtOGEzMi1iODIwOTczNzE1NmIiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtNDYzZi00MzViLTgyOGMtMTA3ZTAwN2EyNzExIiwidXNlcldvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWU3Yy00M2Q5LWE1ZGItNjg1YjUwNjlkODE2IiwidHlwZSI6IkFDQ0VTUyIsImF1dGhQcm92aWRlciI6InBhc3N3b3JkIiwiaWF0IjoxNzUxMjgxNzA0LCJleHAiOjIwNjY4NTc3MDR9.HMGqCsVlOAPVUBhKSGlD1X86VoHKt4LIUtET3CGIdik',
    },
  },
});
