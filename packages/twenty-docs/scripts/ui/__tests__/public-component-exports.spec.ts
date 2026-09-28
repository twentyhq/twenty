import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isUndefined } from '@sniptt/guards';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getPublicComponentExports } from '../../../../twenty-ui/docs/getPublicComponentExports';

describe('public component documentation coverage', () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'ui-component-exports-'));
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  const createFixtureProgram = (files: Record<string, string>) => {
    const filePaths = Object.entries(files).map(([fileName, content]) => {
      const filePath = join(directory, fileName);

      writeFileSync(filePath, content);

      return filePath;
    });
    const program = ts.createProgram(filePaths, {
      noLib: true,
      types: [],
      jsx: ts.JsxEmit.Preserve,
    });
    const getEntryPoint = (name: string, fileName: string) => {
      const source = program.getSourceFile(join(directory, fileName));

      if (isUndefined(source)) {
        throw new Error(`Missing fixture entry point ${fileName}`);
      }

      return { name, source };
    };

    return { checker: program.getTypeChecker(), getEntryPoint };
  };

  it('finds aliased and compound components through barrels without counting types or constants', () => {
    const { checker, getEntryPoint } = createFixtureProgram({
      'components.tsx': `
        export const Button = () => null;
        export const Menu = { Root: () => null };
        export type ButtonProps = { disabled?: boolean };
        export const BUTTON_SIZE = 24;
        export const Internal = () => null;
      `,
      'index.ts': `
        export { Button as Action, Menu, BUTTON_SIZE } from './components';
        export type { ButtonProps } from './components';
      `,
    });

    expect(
      getPublicComponentExports({
        checker,
        entryPoints: [getEntryPoint('twenty-ui/components', 'index.ts')],
      })
        .map(({ name }) => name)
        .sort(),
    ).toEqual(['Action', 'Menu']);
  });

  it('keeps every entry point exporting a component whatever their order', () => {
    const { checker, getEntryPoint } = createFixtureProgram({
      'IconCheck.tsx': 'export const IconCheck = () => null;',
      'icon.ts': "export { IconCheck } from './IconCheck';",
      'index.ts': "export * from './icon';",
    });
    const rootEntryPoint = getEntryPoint('twenty-ui', 'index.ts');
    const iconEntryPoint = getEntryPoint('twenty-ui/icon', 'icon.ts');
    const getSortedEntryPoints = (
      entryPoints: { name: string; source: ts.SourceFile }[],
    ) =>
      getPublicComponentExports({ checker, entryPoints }).map((component) =>
        [...component.entryPoints].sort(),
      );

    expect(getSortedEntryPoints([rootEntryPoint, iconEntryPoint])).toEqual([
      ['twenty-ui', 'twenty-ui/icon'],
    ]);
    expect(getSortedEntryPoints([iconEntryPoint, rootEntryPoint])).toEqual([
      ['twenty-ui', 'twenty-ui/icon'],
    ]);
  });
});
