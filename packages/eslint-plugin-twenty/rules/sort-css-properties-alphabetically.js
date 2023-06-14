"use strict";
const postcss = require("postcss");

function isStyledTagname(node) {
  return (
    (node.tag.type === "Identifier" && node.tag.name === "css") ||
    (node.tag.type === "MemberExpression" &&
      node.tag.object.name === "styled") ||
    (node.tag.type === "CallExpression" &&
      (node.tag.callee.name === "styled" ||
        (node.tag.callee.object &&
          ((node.tag.callee.object.callee &&
            node.tag.callee.object.callee.name === "styled") ||
            (node.tag.callee.object.object &&
              node.tag.callee.object.object.name === "styled")))))
  );
}

/**
 * An atomic rule is a rule without nested rules.
 */
function isValidAtomicRule(rule) {
  const decls = rule.nodes.filter(node => node.type === "decl");
  if (decls.length < 0) {
    return { isValid: true };
  }

  for (let i = 1; i < decls.length; i++) {
    const current = decls[i].prop;
    const prev = decls[i - 1].prop;
    if (current < prev) {
      const loc = {
        start: {
          line: decls[i - 1].source.start.line,
          column: decls[i - 1].source.start.column - 1
        },
        end: {
          line: decls[i].source.end.line,
          column: decls[i].source.end.column - 1
        }
      };

      return { isValid: false, loc };
    }
  }

  return { isValid: true };
}

function isValidRule(rule) {
  // check each rule recursively
  const { isValid, loc } = rule.nodes.reduce(
    (map, node) => {
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
}

function getNodeStyles(node) {
  const [firstQuasi, ...quasis] = node.quasi.quasis;
  // remove line break added to the first quasi
  const lineBreakCount = node.quasi.loc.start.line - 1;
  let styles = `${"\n".repeat(lineBreakCount)}${" ".repeat(
    node.quasi.loc.start.column + 1
  )}${firstQuasi.value.raw}`;

  // replace expression by spaces and line breaks
  quasis.forEach(({ value, loc }, idx) => {
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
}

function create(context) {
  return {
    TaggedTemplateExpression(node) {
      if (isStyledTagname(node)) {
        try {
          const root = postcss.parse(getNodeStyles(node));

          const { isValid, loc } = isValidRule(root);

          if (!isValid) {
            return context.report({
              node,
              messageId: "sort-css-properties-alphabetically",
              loc,
              fix: fixer =>
                fix({
                  rule: root,
                  fixer,
                  src: context.getSourceCode()
                })
            });
          }
        } catch (e) {
          return true;
        }
      }
    }
  };
}

function fix({ rule, fixer, src }) {
  let fixings = [];

  // concat fixings recursively
  rule.nodes.forEach(node => {
    if (node.type === "rule") {
      fixings = [...fixings, ...fix({ rule: node, fixer, src })];
    }
  });

  const declarations = rule.nodes.filter(node => node.type === "decl");
  const sortedDeclarations = sortDeclarations(declarations);

  declarations.forEach((decl, idx) => {
    if (!areSameDeclarations(decl, sortedDeclarations[idx])) {
      try {
        const range = getDeclRange({ decl, src });
        const sortedDeclText = getDeclText({
          decl: sortedDeclarations[idx],
          src
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
}

function areSameDeclarations(a, b) {
  return (
    a.source.start.line === b.source.start.line &&
    a.source.start.column === b.source.start.column
  );
}

function getDeclRange({ decl, src }) {
  const loc = {
    start: {
      line: decl.source.start.line,
      column: decl.source.start.column - 1
    },
    end: {
      line: decl.source.end.line,
      column: decl.source.end.column - 1
    }
  };

  const startIdx = src.getIndexFromLoc(loc.start);
  const endIdx = src.getIndexFromLoc(loc.end);
  return { startIdx, endIdx };
}

function getDeclText({ decl, src }) {
  const { startIdx, endIdx } = getDeclRange({ decl, src });
  return src.getText().substring(startIdx, endIdx + 1);
}

function sortDeclarations(declarations) {
  return declarations
    .slice()
    .sort((declA, declB) => (declA.prop > declB.prop ? 1 : -1));
}

module.exports = {
  meta: {
    docs: {
      description: "Styles are sorted alphabetically.",
      category: "Fill me in",
      recommended: false
    },
    messages: {
      "sort-css-properties-alphabetically":
        "Declarations should be sorted alphabetically."
    },
    fixable: "code"
  },
  create
};