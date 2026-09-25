import { defineRule } from '@oxlint/plugins';

import { typedTokenHelpers } from '../utils/typedTokenHelpers';

export const RULE_NAME = 'no-miscased-acronym-in-identifier';

// The acronyms the team settled on PascalCase for. HTML, CSS, CLI, IDE and HTTP
// are deliberately absent: their ALLCAPS spelling is the established one here.
const ACRONYMS = ['API', 'OIDC', 'SAML', 'SSO', 'URL'];

// A GraphQL method name is the schema field name, so renaming it breaks every
// client query. The casing of those fields is decided in the schema, not here.
const GRAPHQL_FIELD_DECORATORS = [
  'Mutation',
  'Query',
  'ResolveField',
  'ResolveReference',
  'Subscription',
];

// The acronym closes on a capital that starts a lowercase word, so
// SCREAMING_SNAKE_CASE names, where no lowercase letter follows, are left alone.
const MISCASED_ACRONYM_REGEX = new RegExp(
  `(${ACRONYMS.join('|')})(?=[A-Z][a-z])`,
);

const toPascalCase = (acronym: string) =>
  `${acronym.charAt(0)}${acronym.slice(1).toLowerCase()}`;

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow ALLCAPS acronyms in declared identifiers and file names, which drift from the PascalCase spelling the rest of the codebase uses.',
    },
    messages: {
      miscasedAcronym:
        'Write {{corrected}} rather than {{found}} in `{{name}}`. Identifiers spell acronyms in PascalCase, so the two spellings otherwise split every search and autocomplete for the same concept.',
      miscasedAcronymInFilename:
        'Rename `{{name}}` to spell {{found}} as {{corrected}}. A file keeps the casing of the symbol it exports, and the two spellings otherwise split every search for the same concept.',
    },
    schema: [],
  },
  create: (context) => {
    const reportMiscasedAcronym = (node: any) => {
      if (node?.type !== 'Identifier') {
        return;
      }

      const { name } = node;
      const match = name.match(MISCASED_ACRONYM_REGEX);

      if (match === null) {
        return;
      }

      const [found] = match;

      context.report({
        node,
        messageId: 'miscasedAcronym',
        data: { found, corrected: toPascalCase(found), name },
      });
    };

    const reportDeclarationName = (node: any) => reportMiscasedAcronym(node.id);

    return {
      Program: (node: any) => {
        const fileName = context.filename.split(/[/\\]/).pop() ?? '';
        const match = fileName.match(MISCASED_ACRONYM_REGEX);

        if (match === null) {
          return;
        }

        const [found] = match;

        context.report({
          node,
          messageId: 'miscasedAcronymInFilename',
          data: { found, corrected: toPascalCase(found), name: fileName },
        });
      },

      ClassDeclaration: reportDeclarationName,
      FunctionDeclaration: reportDeclarationName,
      TSEnumDeclaration: reportDeclarationName,
      TSInterfaceDeclaration: reportDeclarationName,
      TSTypeAliasDeclaration: reportDeclarationName,
      VariableDeclarator: reportDeclarationName,

      // Object and class properties are left out: they mirror shapes this
      // codebase does not own - entity columns, GraphQL DTO fields, third-party
      // option bags like `baseURL` and `callbackURL`.
      MethodDefinition: (node: any) => {
        if (
          node.computed === true ||
          typedTokenHelpers.nodeHasDecoratorsNamed(
            node,
            GRAPHQL_FIELD_DECORATORS,
          )
        ) {
          return;
        }

        reportMiscasedAcronym(node.key);
      },
    };
  },
});
