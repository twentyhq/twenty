export const backendGraphQLUrl = new URL(
  '/graphql',
  process.env.BACKEND_BASE_URL,
).toString();

// Mirrors the baseURL default in playwright.config.ts.
export const frontendOrigin = new URL(
  process.env.FRONTEND_BASE_URL || 'http://localhost:3001',
).origin;
