import ts from 'typescript';

import { type DeclarationOccurrence } from '../types/DeclarationOccurrence';
import { type ExportKind } from '../types/ExportKind';

const getVariableStatementKind = (
  node: ts.VariableStatement,
): Extract<ExportKind, 'const' | 'let' | 'var'> => {
  const isConst = (node.declarationList.flags & ts.NodeFlags.Const) !== 0;

  if (isConst) {
    return 'const';
  }

  const isLet = (node.declarationList.flags & ts.NodeFlags.Let) !== 0;

  if (isLet) {
    return 'let';
  }

  return 'var';
};

export const extractExportsFromSourceFile = (sourceFile: ts.SourceFile) => {
  const exports: DeclarationOccurrence[] = [];

  const visit = (node: ts.Node) => {
    if (!ts.canHaveModifiers(node)) {
      return ts.forEachChild(node, visit);
    }

    const modifiers = ts.getModifiers(node);
    const isExport = modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );

    if (!isExport && !ts.isExportDeclaration(node)) {
      return ts.forEachChild(node, visit);
    }

    switch (true) {
      case ts.isTypeAliasDeclaration(node):
        exports.push({
          kind: 'type',
          name: node.name.text,
        });
        break;

      case ts.isInterfaceDeclaration(node):
        exports.push({
          kind: 'interface',
          name: node.name.text,
        });
        break;

      case ts.isEnumDeclaration(node):
        exports.push({
          kind: 'enum',
          name: node.name.text,
        });
        break;

      case ts.isFunctionDeclaration(node) && node.name !== undefined:
        exports.push({
          kind: 'function',
          name: node.name.text,
        });
        break;

      case ts.isVariableStatement(node):
        node.declarationList.declarations.forEach((declaration) => {
          const kind = getVariableStatementKind(node);

          if (ts.isIdentifier(declaration.name)) {
            exports.push({
              kind,
              name: declaration.name.text,
            });
          } else if (ts.isObjectBindingPattern(declaration.name)) {
            declaration.name.elements.forEach((element) => {
              if (
                !ts.isBindingElement(element) ||
                !ts.isIdentifier(element.name)
              ) {
                return;
              }

              exports.push({
                kind,
                name: element.name.text,
              });
            });
          }
        });
        break;

      case ts.isClassDeclaration(node) && node.name !== undefined:
        exports.push({
          kind: 'class',
          name: node.name.text,
        });
        break;
      case ts.isExportDeclaration(node):
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          node.exportClause.elements.forEach((element) => {
            const exportName = element.name.text;

            const isTypeExport =
              node.isTypeOnly || ts.isTypeOnlyExportDeclaration(node);

            if (isTypeExport) {
              exports.push({
                kind: 'type',
                name: exportName,
              });
              return;
            }

            exports.push({
              kind: 'const',
              name: exportName,
            });
          });
        }
        break;
    }

    return ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return exports;
};
