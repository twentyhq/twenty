import { TSESTree, ESLintUtils, AST_NODE_TYPES } from "@typescript-eslint/utils";
import postcss from "postcss";
import {
  RuleFixer,
  SourceCode,
} from "@typescript-eslint/utils/ts-eslint";
const createRule = ESLintUtils.RuleCreator((name) => `https://docs.twenty.com`);

const isStyledTagname = (
  node: TSESTree.TaggedTemplateExpression
): boolean =>
  (node.tag.type === "Identifier" && node.tag.name === "css") ||
  (node.tag.type === "MemberExpression" &&
    node.tag.object.type === "Identifier" &&
    node.tag.object.name === "styled") ||
  (node.tag.type === "CallExpression" &&
    (node.tag.callee.type === "Identifier" && node.tag.callee.name === "styled") ||
    // @ts-ignore
    (node.tag.callee.object &&
      // @ts-ignore
      ((node.tag.callee.object.type === "CallExpression" &&
      // @ts-ignore
        node.tag.callee.object.callee.type === "Identifier" &&
        // @ts-ignore
        node.tag.callee.object.callee.name === "styled") ||
        // @ts-ignore
        (node.tag.callee.object.type === "MemberExpression" &&
        // @ts-ignore
          node.tag.callee.object.object.type === "Identifier" &&
          // @ts-ignore
          node.tag.callee.object.object.name === "styled")))
);

/**
 * An atomic rule is a rule without nested rules.
 */
const isValidAtomicRule = (rule: postcss.Rule): { isValid: boolean; loc?: postcss.NodeSource } => {
  const decls = rule.nodes.filter((node: postcss.Node) => node.type === "decl");
  if (decls.length === 0) {
    return { isValid: true };
  }

  for (let i = 1; i < decls.length; i++) {
    const current = decls[i].prop;
    const prev = decls[i - 1].prop;
    if (current < prev) {
      const loc = {
        start: {
          line: decls[i - 1].source?.start?.line || 0,
          column: (decls[i - 1].source?.start?.column || 0) - 1,
        },
        end: {
          line: decls[i].source?.end?.line || 0,
          column: (decls[i].source?.end?.column || 0) - 1,
        },
      };

      return { isValid: false, loc };
    }
  }

  return { isValid: true };
};

const isValidRule = (rule: postcss.Rule): { isValid: boolean; loc?: postcss.NodeSource } => {
  // check each rule recursively
  const { isValid, loc } = rule.nodes.reduce(
    (map:any, node: postcss.Node) => {
      return node.type === "rule" ? isValidRule(node) : map;
    },
    { isValid: true }
  );

  // if there is any invalid rule, return result
  if (!isValid) {
    return { isValid, loc };
  }

  // check declarations
  return isValidAtomicRule(rule);
};

const getNodeStyles = (
  node: TSESTree.TaggedTemplateExpression
): string => {
  const [firstQuasi, ...quasis] = node.quasi.quasis;
  // remove line break added to the first quasi
  const lineBreakCount = (node.quasi.loc?.start?.line || 1) - 1;
  let styles = `${"\n".repeat(lineBreakCount)}${" ".repeat(
    (node.quasi.loc?.start?.column || 0) + 1
  )}${firstQuasi.value.raw}`;

  // replace expression by spaces and line breaks
  quasis.forEach(({ value, loc }, idx) => {
    const prevLoc = idx === 0 ? node.quasi.loc : quasis[idx - 1].loc;
    const lineBreaksCount = (loc?.start?.line || 1) - (prevLoc?.end?.line || 0);
    const spacesCount =
      loc?.start?.line === prevLoc?.end?.line
        ? (loc?.start?.column || 0) - (prevLoc?.end?.column || 0) + 2
        : (loc?.start?.column || 0) + 1;
    styles = `${styles}${" "}${"\n".repeat(lineBreaksCount)}${" ".repeat(
      spacesCount
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
}) => {
  let fixings: ReturnType<RuleFixer["removeRange"] | RuleFixer["insertTextAfterRange"]>[] = [];

  // concat fixings recursively
  rule.nodes.forEach((node: postcss.Node) => {
    if (node.type === "rule") {
      fixings = [...fixings, ...fix({ rule: node, fixer, src })];
    }
  });

  const declarations = rule.nodes.filter((node: postcss.Node) => node.type === "decl");
  const sortedDeclarations = sortDeclarations(declarations);

  declarations.forEach((decl: postcss.Declaration, idx: number) => {
    if (!areSameDeclarations(decl, sortedDeclarations[idx])) {
      try {
        const range = getDeclRange({ decl, src });
        const sortedDeclText = getDeclText({
          decl: sortedDeclarations[idx],
          src,
        });

        fixings.push(fixer.removeRange([range.startIdx, range.endIdx + 1]));
        fixings.push(
          fixer.insertTextAfterRange(
            [range.startIdx, range.startIdx],
            sortedDeclText
          )
        );
      } catch (e) {
        console.log(e);
      }
    }
  });
  return fixings;
};

const areSameDeclarations = (
  a: postcss.Declaration,
  b: postcss.Declaration
): boolean =>
  a.source?.start.line === b.source?.start.line &&
  a.source?.start.column === b.source?.start.column;

const getDeclRange = ({ decl, src }: { decl: postcss.Declaration; src: SourceCode }) => {
  const loc = {
    start: {
      line: decl.source?.start?.line || 1,
      column: (decl.source?.start?.column || 0) - 1,
    },
    end: {
      line: decl.source?.end?.line || 1,
      column: (decl.source?.end?.column || 0) - 1,
    },
  };

  const startIdx = src.getIndexFromLoc(loc.start);
  const endIdx = src.getIndexFromLoc(loc.end);
  return { startIdx, endIdx };
};

const getDeclText = ({ decl, src }: { decl: postcss.Declaration; src: SourceCode }) => {
  const { startIdx, endIdx } = getDeclRange({ decl, src });
  return src.getText().substring(startIdx, endIdx + 1);
};

const sortDeclarations = (
  declarations: postcss.Declaration[]
): postcss.Declaration[] =>
  declarations
    .slice()
    .sort((declA, declB) => (declA.prop > declB.prop ? 1 : -1));

    const sortCssPropertiesAlphabeticallyRule = createRule({
      create(context) {
        return {
          TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression) {
            if (isStyledTagname(node)) {
              try {
                const root = postcss.parse(getNodeStyles(node));
    
                const { isValid, loc } = isValidRule(root);
    
                if (!isValid) {
                  return context.report({
                    node,
                    messageId: "sort-css-properties-alphabetically",
                    loc,
                    fix: (fixer) =>
                      fix({
                        // @ts-ignore
                        rule: root,
                        fixer,
                        src: context.getSourceCode(),
                      }),
                  });
                }
              } catch (e) {
                return true;
              }
            }
          },
        };
      },
      name: "sort-css-properties-alphabetically",
      meta: {
        docs: {
          description: "Styles are sorted alphabetically.",
          recommended: "recommended",
        },
        messages: {
          "sort-css-properties-alphabetically":
            "Declarations should be sorted alphabetically.",
        },
        type: "suggestion",
        schema: [],
        fixable: "code",
      },
      defaultOptions: [],
    });

module.exports = sortCssPropertiesAlphabeticallyRule;
export default sortCssPropertiesAlphabeticallyRule;
