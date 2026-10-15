import ts from 'typescript';

const CASE_IGNORES = [/^(?![A-Z])\S+$/, /^(?![A-Z]{1,3}$)[A-Z0-9_-]+$/];

const VISIBLE_NAMES = new Set([
  'alt',
  'aria-label',
  'buttonLabel',
  'buttonText',
  'description',
  'heading',
  'helpText',
  'label',
  'message',
  'placeholder',
  'text',
  'title',
  'tooltip',
]);

const JSX_VISIBLE_NAMES = new Set([
  'error',
  'errorMessage',
  'helperText',
  'hint',
]);

const TECHNICAL_PLACEHOLDERS = new Set([
  '<p>Hello</p>',
  'auto',
  'XXXXX-XXXXX-XXXXX-XXXXX',
  'yourdomain.com',
  'support@mycompany.com',
  '900960562328-36306ohbk8e3.apps.googleusercontent.com',
  'app.yourdomain.com',
  'crm.yourdomain.com',
  '/my-route',
  'listing',
  'listings',
]);

const isStringNode = (node) =>
  ts.isStringLiteral(node) ||
  ts.isNoSubstitutionTemplateLiteral(node) ||
  ts.isTemplateExpression(node) ||
  ts.isJsxText(node);

const getStringValue = (node) =>
  ts.isTemplateExpression(node)
    ? [node.head.text, ...node.templateSpans.map((span) => span.literal.text)]
        .join('')
        .trim()
    : node.text.trim();

const getName = (node) =>
  ts.isIdentifier(node) || ts.isStringLiteral(node)
    ? node.text
    : node.getText();

const isVisibleName = ({ name, value }) =>
  VISIBLE_NAMES.has(name) &&
  (name !== 'placeholder' || !TECHNICAL_PLACEHOLDERS.has(value));

const isVisibleJsxName = ({ name, value }) =>
  JSX_VISIBLE_NAMES.has(name) || isVisibleName({ name, value });

const isVisibleString = ({ node, value }) => {
  if (ts.isJsxText(node)) {
    return true;
  }

  let expression = node;

  while (
    ts.isParenthesizedExpression(expression.parent) ||
    ts.isAsExpression(expression.parent) ||
    ts.isSatisfiesExpression(expression.parent) ||
    (ts.isConditionalExpression(expression.parent) &&
      expression.parent.condition !== expression)
  ) {
    expression = expression.parent;
  }

  const parent = expression.parent;

  if (ts.isJsxAttribute(parent)) {
    return isVisibleJsxName({ name: getName(parent.name), value });
  }

  if (ts.isJsxExpression(parent)) {
    const container = parent.parent;

    if (ts.isJsxElement(container) || ts.isJsxFragment(container)) {
      return true;
    }

    if (ts.isJsxAttribute(container)) {
      return isVisibleJsxName({ name: getName(container.name), value });
    }
  }

  return (
    ts.isPropertyAssignment(parent) &&
    isVisibleName({ name: getName(parent.name), value })
  );
};

export const createStringDiagnosticFilter = ({ filename, sourceBuffer }) => {
  const sourceFile = ts.createSourceFile(
    filename,
    sourceBuffer.toString('utf8'),
    ts.ScriptTarget.Latest,
    true,
    filename.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  return (span) => {
    if (!span) {
      return true;
    }

    const start = sourceBuffer.subarray(0, span.offset).toString('utf8').length;
    const end =
      start +
      sourceBuffer
        .subarray(span.offset, span.offset + span.length)
        .toString('utf8').length;
    let stringNode;

    const visit = (node) => {
      if (node.pos > start || node.end < end) {
        return;
      }

      if (isStringNode(node)) {
        stringNode = node;
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    if (!stringNode) {
      return true;
    }

    const value = getStringValue(stringNode);

    return (
      !CASE_IGNORES.some((pattern) => pattern.test(value)) ||
      isVisibleString({ node: stringNode, value })
    );
  };
};
