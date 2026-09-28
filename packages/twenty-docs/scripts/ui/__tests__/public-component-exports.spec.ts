import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { getPublicComponentExports } from '../../../../twenty-ui/docs/getPublicComponentExports';

describe('public component documentation coverage', () => {
  it('finds aliased and compound components through barrels without counting types or constants', () => {
    const directory = mkdtempSync(join(tmpdir(), 'ui-component-exports-'));

    try {
      writeFileSync(
        join(directory, 'components.tsx'),
        `
        export const Button = () => null;
        export const Menu = { Root: () => null };
        export type ButtonProps = { disabled?: boolean };
        export const BUTTON_SIZE = 24;
        export const Internal = () => null;
      `,
      );
      writeFileSync(
        join(directory, 'index.ts'),
        `
        export { Button as Action, Menu, BUTTON_SIZE } from './components';
        export type { ButtonProps } from './components';
      `,
      );
      const entryPath = join(directory, 'index.ts');
      const program = ts.createProgram([entryPath], {
        noLib: true,
        jsx: ts.JsxEmit.Preserve,
      });
      const source = program.getSourceFile(entryPath);

      if (!source) {
        throw new Error('Missing fixture entry point');
      }

      expect(
        getPublicComponentExports({
          checker: program.getTypeChecker(),
          entryPoints: [{ name: 'twenty-ui/components', source }],
        })
          .map(({ name }) => name)
          .sort(),
      ).toEqual(['Action', 'Menu']);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
