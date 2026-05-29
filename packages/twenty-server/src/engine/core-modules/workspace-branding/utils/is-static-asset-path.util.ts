const STATIC_ASSET_PATH_PATTERN =
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|map|json|txt|webp|wasm)$/i;

const API_PATH_PREFIXES = [
  '/graphql',
  '/metadata',
  '/rest/',
  '/rest',
  '/file/',
  '/files/',
  '/webhooks',
  '/mcp',
  '/admin-panel',
  '/auth/',
  '/health',
  '/client-config',
  '/open-api',
  '/public-assets/',
  '/s/',
];

export const isStaticAssetPath = (path: string): boolean =>
  STATIC_ASSET_PATH_PATTERN.test(path);

export const isApiPath = (path: string): boolean =>
  API_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix),
  );
