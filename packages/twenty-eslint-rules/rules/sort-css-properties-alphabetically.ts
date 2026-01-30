import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';
import {
  type RuleFix,
  type RuleFixer,
  type SourceCode,
} from '@typescript-eslint/utils/ts-eslint';

import postcss from 'postcss';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-sort-css-properties-alphabetically"
export const RULE_NAME = 'sort-css-properties-alphabetically';

interface Loc {
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
}

const isMemberExpression = (
  node: TSESTree.Node,
): node is TSESTree.MemberExpression =>
  node.type === TSESTree.AST_NODE_TYPES.MemberExpression;
const isCallExpression = (
  node: TSESTree.Node,
): node is TSESTree.CallExpression =>
  node.type === TSESTree.AST_NODE_TYPES.CallExpression;

const isStyledTagname = (node: TSESTree.TaggedTemplateExpression): boolean => {
  if (isIdentifier(node.tag)) {
    return node.tag.name === 'css';
  }

  if (isMemberExpression(node.tag) && isIdentifier(node.tag.object)) {
    return node.tag.object.name === 'styled';
  }

  if (isCallExpression(node.tag) && isIdentifier(node.tag.callee)) {
    return node.tag.callee.name === 'styled';
  }

  if (
    isCallExpression(node.tag) &&
    isMemberExpression(node.tag.callee) &&
    isIdentifier(node.tag.callee.object)
  ) {
    return node.tag.callee.object.name === 'styled';
  }

  if (
    isCallExpression(node.tag) &&
    isMemberExpression(node.tag.callee) &&
    isMemberExpression(node.tag.callee.object) &&
    isIdentifier(node.tag.callee.object.object)
  ) {
    return node.tag.callee.object.object.name === 'styled';
  }

  return false;
};

/**
 * An atomic rule is a rule without nested rules.
 */
const isValidAtomicRule = (
  rule: postcss.Rule,
): { isValid: boolean; loc?: Loc } => {
  const decls = rule.nodes.filter(
    (node) => node.type === 'decl',
  ) as unknown as postcss.Declaration[];

  const invalidDeclIndex = decls.findIndex((decl, index) => {
    if (index === 0) return false;

    const current = decl.prop;
    const prev = decls[index - 1].prop;

    return current < prev;
  });

  return invalidDeclIndex > 0
    ? {
        isValid: false,
        loc: {
          start: {
            line: decls[invalidDeclIndex - 1].source!.start!.line,
            column: decls[invalidDeclIndex - 1].source!.start!.column - 1,
          },
          end: {
            line: decls[invalidDeclIndex].source!.end!.line,
            column: decls[invalidDeclIndex].source!.end!.column - 1,
          },
        },
      }
    : { isValid: true };
};

const isValidRule = (rule: postcss.Rule): { isValid: boolean; loc?: Loc } => {
  // check each rule recursively
  const { isValid, loc } = rule.nodes.reduce<{ isValid: boolean; loc?: Loc }>(
    (map, node) => {
      return node.type === 'rule' ? isValidRule(node) : map;
    },
    { isValid: true },
  );

  // if there is any invalid rule, return result
  if (!isValid) {
    return { isValid, loc };
  }

  // check declarations
  return isValidAtomicRule(rule);
};

const getNodeStyles = (node: TSESTree.TaggedTemplateExpression): string => {
  const [firstQuasi, ...quasis] = node.quasi.quasis;
  // remove line break added to the first quasi
  const lineBreakCount = node.quasi.loc.start.line - 1;
  let styles = `${'\n'.repeat(lineBreakCount)}${' '.repeat(
    node.quasi.loc.start.column + 1,
  )}${firstQuasi.value.raw}`;

  // replace expression by spaces and line breaks
  quasis.forEach(({ value, loc }, idx) => {
    const prevLoc = idx === 0 ? firstQuasi.loc : quasis[idx - 1].loc;
    const lineBreaksCount = loc.start.line - prevLoc.end.line;
    const spacesCount =
      loc.start.line === prevLoc.end.line
        ? loc.start.column - prevLoc.end.column + 2
        : loc.start.column + 1;
    styles = `${styles}${' '}${'\n'.repeat(lineBreaksCount)}${' '.repeat(
      spacesCount,
    )}${value.raw}`;
  });

  return styles;
};

const fix = ({
  rule,
  fixer,
  src,
}: {
  rule: postcss.Rule;
  fixer: RuleFixer;
  src: SourceCode;
}): RuleFix[] => {
  // concat fixings recursively
  const fixings = rule.nodes
    .filter((node): node is postcss.Rule => node.type === 'rule')
    .flatMap((node) => fix({ rule: node, fixer, src }));

  const declarations = rule.nodes.filter(
    (node): node is postcss.Declaration => node.type === 'decl',
  );
  const sortedDeclarations = sortDeclarations(declarations);

  return [
    ...fixings,
    ...declarations.flatMap((decl, index) => {
      if (!areSameDeclarations(decl, sortedDeclarations[index])) {
        try {
          const range = getDeclRange({ decl, src });
          const sortedDeclText = getDeclText({
            decl: sortedDeclarations[index],
            src,
          });

          return [
            fixer.removeRange([range.startIdx, range.endIdx + 1]),
            fixer.insertTextAfterRange(
              [range.startIdx, range.startIdx],
              sortedDeclText,
            ),
          ];
        } catch (e) {
          console.log(e);
        }
      }
    }),
  ];
};

const areSameDeclarations = (
  a: postcss.ChildNode,
  b: postcss.ChildNode,
): boolean =>
  a.source!.start!.line === b.source!.start!.line &&
  a.source!.start!.column === b.source!.start!.column;

const getDeclRange = ({
  decl,
  src,
}: {
  decl: postcss.ChildNode;
  src: SourceCode;
}): { startIdx: number; endIdx: number } => {
  const loc = {
    start: {
      line: decl.source!.start!.line,
      column: decl.source!.start!.column - 1,
    },
    end: {
      line: decl.source!.end!.line,
      column: decl.source!.end!.column - 1,
    },
  };

  const startIdx = src.getIndexFromLoc(loc.start);
  const endIdx = src.getIndexFromLoc(loc.end);
  return { startIdx, endIdx };
};

const getDeclText = ({
  decl,
  src,
}: {
  decl: postcss.ChildNode;
  src: SourceCode;
}) => {
  const { startIdx, endIdx } = getDeclRange({ decl, src });
  return src.getText().substring(startIdx, endIdx + 1);
};

const sortDeclarations = (declarations: postcss.Declaration[]) =>
  declarations
    .slice()
    .sort((declA, declB) => (declA.prop > declB.prop ? 1 : -1));

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    docs: {
      description: 'Styles are sorted alphabetically.',
      recommended: 'recommended',
    },
    messages: {
      sortCssPropertiesAlphabetically:
        'Declarations should be sorted alphabetically.',
    },
    type: 'suggestion',
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],
  create: (context) => {
    return {
      TaggedTemplateExpression: (node) => {
        if (!isStyledTagname(node)) return;

        try {
          const root = postcss.parse(
            getNodeStyles(node),
          ) as unknown as postcss.Rule;

          const { isValid } = isValidRule(root);

          if (!isValid) {
            return context.report({
              node,
              messageId: 'sortCssPropertiesAlphabetically',
              fix: (fixer) =>
                fix({
                  rule: root,
                  fixer,
                  src: context.sourceCode,
                }),
            });
          }
        } catch (e) {
          return true;
        }
      },
    };
  },
});
