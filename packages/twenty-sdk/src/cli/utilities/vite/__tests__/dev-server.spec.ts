import path from 'path';

// Mock vite to avoid ESM parsing issues in Jest
jest.mock('vite', () => ({
  createServer: jest.fn().mockResolvedValue({
    listen: jest.fn(),
    close: jest.fn(),
  }),
}));

import { createDevServerConfig } from '../dev-server';

describe('createDevServerConfig', () => {
  const appPath = '/test/app';

  it('should create config with empty entry points', () => {
    const config = createDevServerConfig({
      appPath,
      functionEntryPoints: [],
    });

    expect(config.root).toBe(appPath);
    expect(config.build?.rollupOptions?.input).toEqual({});
  });

  it('should create config with function entry points as rollup input', () => {
    const entryPoints = [
      'src/app/hello.function.ts',
      'src/app/goodbye.function.ts',
    ];

    const config = createDevServerConfig({
      appPath,
      functionEntryPoints: entryPoints,
    });

    expect(config.build?.rollupOptions?.input).toEqual({
      'hello.function': path.join(appPath, 'src/app/hello.function.ts'),
      'goodbye.function': path.join(appPath, 'src/app/goodbye.function.ts'),
    });
  });

  it('should include plugins when provided', () => {
    const mockPlugin = { name: 'test-plugin' };

    const config = createDevServerConfig({
      appPath,
      functionEntryPoints: [],
      plugins: [mockPlugin],
    });

    expect(config.plugins).toContain(mockPlugin);
  });

  it('should configure server with correct watch settings', () => {
    const config = createDevServerConfig({
      appPath,
      functionEntryPoints: [],
    });

    expect(config.server?.watch?.ignored).toContain('**/node_modules/**');
    expect(config.server?.watch?.ignored).toContain('**/.twenty/**');
    expect(config.server?.watch?.ignored).toContain('**/dist/**');
  });

  it('should disable HMR', () => {
    const config = createDevServerConfig({
      appPath,
      functionEntryPoints: [],
    });

    expect(config.server?.hmr).toBe(false);
  });

  it('should use dynamic port', () => {
    const config = createDevServerConfig({
      appPath,
      functionEntryPoints: [],
    });

    expect(config.server?.port).toBe(0);
  });

  it('should disable optimizeDeps discovery', () => {
    const config = createDevServerConfig({
      appPath,
      functionEntryPoints: [],
    });

    expect(config.optimizeDeps?.noDiscovery).toBe(true);
  });

  it('should set silent log level', () => {
    const config = createDevServerConfig({
      appPath,
      functionEntryPoints: [],
    });

    expect(config.logLevel).toBe('silent');
  });

  it('should configure build watch to include src folder', () => {
    const config = createDevServerConfig({
      appPath,
      functionEntryPoints: [],
    });

    expect(config.build?.watch).toEqual({
      include: [path.join(appPath, 'src/**')],
    });
  });
});
