import path from 'path';
import { createServer, type ViteDevServer } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Singleton Vite dev server per appPath
const servers = new Map<string, ViteDevServer>();

export const getViteServer = async (appPath: string): Promise<ViteDevServer> => {
  const existing = servers.get(appPath);
  if (existing) {
    return existing;
  }

  const server = await createServer({
    root: appPath,
    plugins: [tsconfigPaths({ root: appPath })],
    server: { middlewareMode: true },
    optimizeDeps: { disabled: true },
    logLevel: 'silent',
    configFile: false,
    esbuild: {
      jsx: 'automatic',
    },
  });

  servers.set(appPath, server);
  return server;
};

export const closeViteServer = async (appPath?: string): Promise<void> => {
  if (appPath) {
    const server = servers.get(appPath);
    if (server) {
      await server.close();
      servers.delete(appPath);
    }
  } else {
    // Close all servers
    for (const [key, server] of servers) {
      await server.close();
      servers.delete(key);
    }
  }
};

// Load a module using Vite's SSR loader
export const loadModule = async (
  server: ViteDevServer,
  filepath: string,
): Promise<Record<string, unknown>> => {
  return (await server.ssrLoadModule(filepath)) as Record<string, unknown>;
};

// Find where an identifier was imported from by parsing the source
// and using Vite's module graph to resolve the import path
export const findImportSource = async (
  server: ViteDevServer,
  filepath: string,
  identifier: string,
  appPath: string,
): Promise<string | null> => {
  // Read the source and find import statements
  const fs = await import('fs-extra');
  const source = await fs.default.readFile(filepath, 'utf8');

  // Find the import statement that imports the identifier
  const importRegexes = [
    // Named import: import { identifier } from 'path'
    new RegExp(
      `import\\s*\\{[^}]*\\b${identifier}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
    ),
    // Aliased import: import { something as identifier } from 'path'
    new RegExp(
      `import\\s*\\{[^}]*\\w+\\s+as\\s+${identifier}[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`,
    ),
    // Default import: import identifier from 'path'
    new RegExp(`import\\s+${identifier}\\s+from\\s*['"]([^'"]+)['"]`),
  ];

  let importSpecifier: string | null = null;
  for (const regex of importRegexes) {
    const match = source.match(regex);
    if (match) {
      importSpecifier = match[1];
      break;
    }
  }

  if (!importSpecifier) {
    // Not imported, must be defined in the same file
    return null;
  }

  // Use Vite to resolve the import path
  const resolved = await server.pluginContainer.resolveId(importSpecifier, filepath);
  if (resolved?.id) {
    return path.relative(appPath, resolved.id).replace(/\\/g, '/');
  }

  // Fallback to simple relative path resolution
  if (importSpecifier.startsWith('.')) {
    const fileDir = path.dirname(filepath);
    const absolutePath = path.resolve(fileDir, importSpecifier);
    const relativePath = path.relative(appPath, absolutePath);
    return (
      relativePath.endsWith('.ts') ? relativePath : `${relativePath}.ts`
    ).replace(/\\/g, '/');
  }

  return null;
};
