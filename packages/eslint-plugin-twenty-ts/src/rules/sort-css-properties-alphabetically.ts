import { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: "Styles are sorted alphabetically.",
      category: "Fill me in",
      recommended: false,
    },
    messages: {
      "sort-css-properties-alphabetically":
        "Declarations should be sorted alphabetically.",
    },
    fixable: "code",
  },
  create: (context) => {
    const isStyledTagname = (node: any) =>
      (node.tag.type === "Identifier" && node.tag.name === "css") ||
      (node.tag.type === "MemberExpression" && node.tag.object.name === "styled") ||
      (node.tag.type === "CallExpression" &&
        (node.tag.callee.name === "styled" ||
          (node.tag.callee.object &&
            ((node.tag.callee.object.callee &&
              node.tag.callee.object.callee.name === "styled") ||
              (node.tag.callee.object.object &&
                node.tag.callee.object.object.name === "styled")))));

    const isValidAtomicRule = (rule: any) => {
      const decls = rule.nodes.filter((node: any) => node.type === "decl");
      if (decls.length <= 1) {
        return { isValid: true };
      }

      for (let i = 1; i < decls.length; i++) {
        const current = decls[i].prop;
        const prev = decls[i - 1].prop;
        if (current < prev) {
          const loc = {
            start: {
              line: decls[i - 1].source.start.line,
              column: decls[i - 1].source.start.column - 1,
            },
            end: {
              line: decls[i].source.end.line,
              column: decls[i].source.end.column - 1,
            },
          };

          return { isValid: false, loc };
        }
      }

      return { isValid: true };
    };

    const isValidRule = (rule: any) => {
      const { isValid, loc } = rule.nodes.reduce(
        (map: any, node: any) => {
          return node.type === "rule" ? isValidRule(node) : map;
        },
        { isValid: true }
      );

      if (!isValid) {
        return { isValid, loc };
      }

      return isValidAtomicRule(rule);
    };

    const getNodeStyles = (node: any) => {
      const [firstQuasi, ...quasis] = node.quasi.quasis;
      const lineBreakCount = node.quasi.loc.start.line - 1;
      let styles = `${"\n".repeat(lineBreakCount)}${" ".repeat(
        node.quasi.loc.start.column + 1
      )}${firstQuasi.value.raw}`;

      quasis.forEach(({ value, loc }: any, idx: number) => {
        const prevLoc = idx === 0 ? firstQuasi.loc : quasis[idx - 1].loc;
        const lineBreaksCount = loc.start.line - prevLoc.end.line;
        const spacesCount =
          loc.start.line === prevLoc.end.line
            ? loc.start.column - prevLoc.end.column + 2
            : loc.start.column + 1;
        styles = `${styles}${" "}${"\n".repeat(lineBreaksCount)}${" ".repeat(
          spacesCount
        )}${value.raw}`;
      });

      return styles;
    };

    const fix = ({ rule, fixer, src }: any) => {
      let fixings: any[] = [];

      rule.nodes.forEach((node: any) => {
        if (node.type === "rule") {
          fixings = [...fixings, ...fix({ rule: node, fixer, src })];
        }
      });

      const declarations = rule.nodes.filter((node: any) => node.type === "decl");
      const sortedDeclarations = sortDeclarations(declarations);

      declarations.forEach((decl: any, idx: number) => {
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

    const areSameDeclarations = (a: any, b: any) =>
      a.source.start.line === b.source.start.line &&
      a.source.start.column === b.source.start.column;

    const getDeclRange = ({ decl, src }: any) => {
      const loc = {
        start: {
          line: decl.source.start.line,
          column: decl.source.start.column - 1,
        },
        end: {
          line: decl.source.end.line,
          column: decl.source.end.column - 1,
        },
      };

      const startIdx = src.getIndexFromLoc(loc.start);
      const endIdx = src.getIndexFromLoc(loc.end);
      return { startIdx, endIdx };
    };

    const getDeclText = ({ decl, src }: any) => {
      const { startIdx, endIdx } = getDeclRange({ decl, src });
      return src.getText().substring(startIdx, endIdx + 1);
    };

    const sortDeclarations = (declarations: any[]) =>
      declarations
        .slice()
        .sort((declA: any, declB: any) => (declA.prop > declB.prop ? 1 : -1));

    return {
      TaggedTemplateExpression(node: any) {
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
};

export default rule;
