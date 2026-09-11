import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { getDocumentationImportDiagnostics } from '../../../../twenty-ui/docs/getDocumentationImportDiagnostics';

const exportedModules = new Set([
  'twenty-ui',
  'twenty-ui/input',
  'twenty-ui/style.css',
]);

const checkImports = (content: string) =>
  getDocumentationImportDiagnostics({
    source: ts.createSourceFile(
      'example.tsx',
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    ),
    exportedModules,
  });

describe('documentation imports', () => {
  it('allows public entry points, exported CSS, and other packages', () => {
    expect(
      checkImports(`
      import { Input } from 'twenty-ui/input';
      import 'twenty-ui/style.css';
      export { Text } from 'twenty-ui';
      import { useState } from 'react';
    `),
    ).toEqual([]);
  });

  it.each([
    "import { Internal } from 'twenty-ui/internal';",
    "import 'twenty-ui/private.css';",
    "export { Internal } from 'twenty-ui/internal';",
    "const component = import('twenty-ui/internal');",
    "type Internal = import('twenty-ui/internal').Internal;",
    "const component = require('twenty-ui/internal');",
  ])('rejects an unpublished subpath in %s', (content) => {
    const diagnostics = checkImports(content);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].category).toBe(ts.DiagnosticCategory.Error);
    expect(diagnostics[0].messageText).toContain(
      'is not exported by twenty-ui/package.json',
    );
  });
});
