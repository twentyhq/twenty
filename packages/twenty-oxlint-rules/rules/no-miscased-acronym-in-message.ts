import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'no-miscased-acronym-in-message';

const MESSAGE_TAG_NAMES = ['t', 'msg', 'defineMessage'];

const CORRECT_CASING: Record<string, string> = {
  Api: 'API',
  Apis: 'APIs',
  Cdn: 'CDN',
  Cname: 'CNAME',
  Cors: 'CORS',
  Crm: 'CRM',
  Csv: 'CSV',
  Dkim: 'DKIM',
  Dmarc: 'DMARC',
  Dns: 'DNS',
  Html: 'HTML',
  Http: 'HTTP',
  Https: 'HTTPS',
  Id: 'ID',
  Ids: 'IDs',
  Imap: 'IMAP',
  Json: 'JSON',
  Jwt: 'JWT',
  Mfa: 'MFA',
  Oauth: 'OAuth',
  Otp: 'OTP',
  Pdf: 'PDF',
  Saml: 'SAML',
  Sdk: 'SDK',
  Smtp: 'SMTP',
  Sql: 'SQL',
  Sso: 'SSO',
  Ssl: 'SSL',
  Tls: 'TLS',
  Totp: 'TOTP',
  Ttl: 'TTL',
  Uid: 'UID',
  Url: 'URL',
  Urls: 'URLs',
  Uuid: 'UUID',
  Xml: 'XML',
  Yaml: 'YAML',
};

// `}` is a boundary so `${fieldName}Id`, a code identifier rather than a word, is left alone.
// The trailing guard rejects `Identity` and `Urls` alike; `Urls` only matches because the map lists it.
const MISCASED_ACRONYM_REGEX = new RegExp(
  `(?<![A-Za-z}])(${Object.keys(CORRECT_CASING).join('|')})(?![a-z])`,
  'g',
);

const getTagName = (tag: any): string | undefined => {
  if (tag.type === 'Identifier') {
    return tag.name;
  }

  // useLingui() returns the macro on an object, so `i18n.t` and `_.t` are extracted like a bare tag
  if (tag.type === 'MemberExpression' && tag.property.type === 'Identifier') {
    return tag.property.name;
  }

  return undefined;
};

const findMiscasedAcronyms = (text: string): string[] => [
  ...new Set([...text.matchAll(MISCASED_ACRONYM_REGEX)].map(([word]) => word)),
];

// Quasis are split at placeholders, so restore the brace or the boundary guard would wave `Id` through
const withPrecedingPlaceholder = (
  text: string,
  isPrecededByPlaceholder: boolean,
): string => (isPrecededByPlaceholder ? `}${text}` : text);

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow title-cased acronyms in translatable source strings, which translators render correctly and Crowdin then reports as a mismatch.',
    },
    messages: {
      miscasedAcronym:
        'Write {{corrected}} rather than {{found}} in a translatable string. Translators render the acronym correctly in their own language, so the miscased English is what Crowdin reports as a QA failure - and it ships to users as a wrong label.',
    },
    schema: [],
  },
  create: (context) => {
    const reportMiscasedAcronyms = (
      node: any,
      text: string,
      isPrecededByPlaceholder = false,
    ) => {
      for (const found of findMiscasedAcronyms(
        withPrecedingPlaceholder(text, isPrecededByPlaceholder),
      )) {
        context.report({
          node,
          messageId: 'miscasedAcronym',
          data: { found, corrected: CORRECT_CASING[found] },
        });
      }
    };

    return {
      TaggedTemplateExpression: (node: any) => {
        const tagName = getTagName(node.tag);

        if (tagName === undefined || !MESSAGE_TAG_NAMES.includes(tagName)) {
          return;
        }

        node.quasi.quasis.forEach((quasi: any, index: number) => {
          reportMiscasedAcronyms(
            quasi,
            quasi.value.cooked ?? quasi.value.raw,
            index > 0,
          );
        });
      },

      // The descriptor form standard field metadata uses, where this defect collected
      CallExpression: (node: any) => {
        const calleeName = getTagName(node.callee);

        if (
          calleeName === undefined ||
          !MESSAGE_TAG_NAMES.includes(calleeName)
        ) {
          return;
        }

        const [argument] = node.arguments;

        if (argument?.type !== 'ObjectExpression') {
          return;
        }

        for (const property of argument.properties) {
          if (
            property.type !== 'Property' ||
            property.key.type !== 'Identifier' ||
            property.key.name !== 'message'
          ) {
            continue;
          }

          const { value } = property;

          if (value.type === 'TemplateLiteral') {
            value.quasis.forEach((quasi: any, index: number) => {
              reportMiscasedAcronyms(
                quasi,
                quasi.value.cooked ?? quasi.value.raw,
                index > 0,
              );
            });
          }

          if (value.type === 'Literal' && typeof value.value === 'string') {
            reportMiscasedAcronyms(value, value.value);
          }
        }
      },

      // Trans children only: plain JSX text is not a translatable string
      JSXElement: (node: any) => {
        if (
          node.openingElement.name.type !== 'JSXIdentifier' ||
          node.openingElement.name.name !== 'Trans'
        ) {
          return;
        }

        for (const child of node.children) {
          if (child.type === 'JSXText') {
            reportMiscasedAcronyms(child, child.value);
          }
        }
      },
    };
  },
});
