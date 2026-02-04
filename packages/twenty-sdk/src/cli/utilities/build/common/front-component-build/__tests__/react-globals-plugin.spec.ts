import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

import { reactGlobalsPlugin } from '../react-globals-plugin';

describe('reactGlobalsPlugin', () => {
  const tempDir = path.join(__dirname, '.temp-test');
  const tempFile = path.join(tempDir, 'test-component.tsx');

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  const buildWithPlugin = async (code: string): Promise<string> => {
    fs.writeFileSync(tempFile, code, 'utf-8');

    const result = await esbuild.build({
      entryPoints: [tempFile],
      bundle: true,
      write: false,
      format: 'esm',
      jsx: 'automatic',
      plugins: [reactGlobalsPlugin],
    });

    return result.outputFiles[0].text;
  };

  describe('react/jsx-runtime imports', () => {
    it('should replace jsx import with globalThis.jsx', async () => {
      const code = `
        import { jsx } from 'react/jsx-runtime';
        export const Component = () => jsx('div', {});
      `;

      const result = await buildWithPlugin(code);

      expect(result).toContain('globalThis.jsx');
      expect(result).not.toContain('from "react/jsx-runtime"');
    });

    it('should replace jsxs import with globalThis.jsxs', async () => {
      const code = `
        import { jsxs } from 'react/jsx-runtime';
        export const Component = () => jsxs('div', {});
      `;

      const result = await buildWithPlugin(code);

      expect(result).toContain('globalThis.jsxs');
      expect(result).not.toContain('from "react/jsx-runtime"');
    });

    it('should replace Fragment import with globalThis.React.Fragment', async () => {
      const code = `
        import { Fragment } from 'react/jsx-runtime';
        export const Component = () => Fragment;
      `;

      const result = await buildWithPlugin(code);

      expect(result).toContain('globalThis.React.Fragment');
      expect(result).not.toContain('from "react/jsx-runtime"');
    });
  });

  describe('react imports', () => {
    it('should replace useState with globalThis.React.useState', async () => {
      const code = `
        import { useState } from 'react';
        export const Component = () => {
          const [state, setState] = useState(0);
          return state;
        };
      `;

      const result = await buildWithPlugin(code);

      expect(result).toContain('globalThis.React.useState');
      expect(result).not.toContain('from "react"');
    });

    it('should replace multiple hooks with globalThis.React equivalents', async () => {
      const code = `
        import { useState, useEffect, useCallback } from 'react';
        export const Component = () => {
          const [state, setState] = useState(0);
          useEffect(() => {}, []);
          const cb = useCallback(() => {}, []);
          return state;
        };
      `;

      const result = await buildWithPlugin(code);

      expect(result).toContain('globalThis.React.useState');
      expect(result).toContain('globalThis.React.useEffect');
      expect(result).toContain('globalThis.React.useCallback');
      expect(result).not.toContain('from "react"');
    });

    it('should replace default React import with globalThis.React', async () => {
      const code = `
        import React from 'react';
        export const Component = () => React.createElement('div');
      `;

      const result = await buildWithPlugin(code);

      expect(result).toContain('globalThis.React');
      expect(result).not.toContain('from "react"');
    });
  });

  describe('JSX transformation with plugin', () => {
    it('should transform JSX using globalThis.jsx', async () => {
      const code = `
        export const Component = () => <div>Hello</div>;
      `;

      const result = await buildWithPlugin(code);

      expect(result).toContain('globalThis.jsx');
      expect(result).not.toContain('from "react/jsx-runtime"');
    });

    it('should transform JSX with multiple children using globalThis.jsxs', async () => {
      const code = `
        export const Component = () => (
          <div>
            <span>One</span>
            <span>Two</span>
          </div>
        );
      `;

      const result = await buildWithPlugin(code);

      expect(result).toContain('globalThis.jsxs');
      expect(result).not.toContain('from "react/jsx-runtime"');
    });
  });

  describe('only include used React exports', () => {
    it('should only include used React exports', async () => {
      const code = `
        import { useState, useEffect } from 'react';
        export const Component = () => {
          const [state, setState] = useState(0);
          useEffect(() => {}, []);
          return state;
        };
      `;

      const result = await buildWithPlugin(code);

      expect(result).toContain('globalThis.React.useState');
      expect(result).toContain('globalThis.React.useEffect');
      expect(result).not.toContain('globalThis.React.useCallback');
      expect(result).not.toContain('globalThis.React.useMemo');
      expect(result).not.toContain('globalThis.React.useRef');
      expect(result).not.toContain('globalThis.React.useReducer');
    });

    it('should handle aliased imports', async () => {
      const code = `
        import { useState as useLocalState } from 'react';
        export const Component = () => {
          const [state] = useLocalState(0);
          return state;
        };
      `;

      const result = await buildWithPlugin(code);

      expect(result).toContain('globalThis.React.useState');
      expect(result).not.toContain('globalThis.React.useEffect');
    });

    it('should handle mixed default and named imports', async () => {
      const code = `
        import React, { useState } from 'react';
        export const Component = () => {
          const [state] = useState(0);
          return React.createElement('div', null, state);
        };
      `;

      const result = await buildWithPlugin(code);

      expect(result).toContain('globalThis.React.useState');
      expect(result).toContain('globalThis.React');
      expect(result).not.toContain('globalThis.React.useEffect');
    });
  });

  describe('multiple entry points', () => {
    it('should handle multiple files with different React imports', async () => {
      const fileA = path.join(tempDir, 'component-a.tsx');
      const fileB = path.join(tempDir, 'component-b.tsx');

      fs.writeFileSync(
        fileA,
        `
        import { useState } from 'react';
        export const ComponentA = () => {
          const [state] = useState(0);
          return state;
        };
      `,
        'utf-8',
      );

      fs.writeFileSync(
        fileB,
        `
        import { useEffect } from 'react';
        export const ComponentB = () => {
          useEffect(() => {}, []);
          return null;
        };
      `,
        'utf-8',
      );

      const result = await esbuild.build({
        entryPoints: [fileA, fileB],
        bundle: true,
        write: false,
        format: 'esm',
        jsx: 'automatic',
        outdir: tempDir,
        plugins: [reactGlobalsPlugin],
      });

      const outputA = result.outputFiles.find(
        (f) => path.basename(f.path) === 'component-a.js',
      )?.text;
      const outputB = result.outputFiles.find(
        (f) => path.basename(f.path) === 'component-b.js',
      )?.text;

      expect(outputA).toBeDefined();
      expect(outputB).toBeDefined();

      // Each file should only include the React exports it needs
      expect(outputA).toContain('globalThis.React.useState');
      expect(outputB).toContain('globalThis.React.useEffect');
      expect(outputA).not.toContain('globalThis.React.useEffect');
      expect(outputB).not.toContain('globalThis.React.useState');

      // No raw react imports should remain
      expect(outputA).not.toContain('from "react"');
      expect(outputB).not.toContain('from "react"');
    });
  });
});
