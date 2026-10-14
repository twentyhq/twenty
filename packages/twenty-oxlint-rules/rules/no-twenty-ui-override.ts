import { defineRule } from '@oxlint/plugins';
import { isString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { TWENTY_UI_OVERRIDE_EXEMPTIONS } from './no-twenty-ui-override.exemptions';

export const RULE_NAME = 'no-twenty-ui-override';

const TWENTY_UI_COMPONENT_IMPORT_SOURCE_REGEX =
  /^twenty-ui\/(primitives|components)(\/|$)/;

const STYLING_PROP_NAME_REGEX = /^(className|style|\w+ClassName)$/;

const PRIVATE_CSS_VARIABLE_NAME_REGEX = /^--(tw|card)-/;

const PRIVATE_CSS_VARIABLE_DECLARATION_REGEX =
  /(?<=^|[\s;{])--(?:tw|card)-[\w-]*(?=\s*:)/g;

const PRIVATE_TWENTY_UI_ATTRIBUTE_NAMES = [
  'data-active',
  'data-anchor-hidden',
  'data-dropdown-item',
  'data-dropdown-search',
  'data-grouped',
  'data-skeleton',
];

const PRIVATE_TWENTY_UI_ATTRIBUTE_PREFIXES = ['data-badge-'];

const PRIVATE_ATTRIBUTE_SELECTOR_REGEX = new RegExp(
  `(?<=\\[\\s*)(?:${[
    ...PRIVATE_TWENTY_UI_ATTRIBUTE_PREFIXES.map((prefix) => `${prefix}[\\w-]+`),
    ...PRIVATE_TWENTY_UI_ATTRIBUTE_NAMES,
  ].join('|')})(?![\\w-])`,
  'g',
);

const SELECTOR_TEXT_ENDING_ON_STYLED_ELEMENT_REGEX =
  /&(?:\[[^\]]*\]|[:.][\w-]+(?:\([^)]*\))?)*\[\s*$/;

const DOUBLE_AMPERSAND_REGEX = /&&/g;

const IMPORTANT_REGEX = /!\s*important/gi;

const ELEMENT_QUERY_METHOD_NAMES = new Set([
  'closest',
  'matches',
  'querySelector',
  'querySelectorAll',
]);

const isExemptFile = (filename: string): boolean =>
  TWENTY_UI_OVERRIDE_EXEMPTIONS.some(({ filePath }) =>
    filename.endsWith(`/${filePath}`),
  );

const isLinariaTag = (tag: any): boolean => {
  if (tag?.type === 'Identifier') {
    return tag.name === 'css' || tag.name === 'styled';
  }

  if (tag?.type === 'MemberExpression') {
    return isLinariaTag(tag.object);
  }

  if (tag?.type === 'CallExpression') {
    return isLinariaTag(tag.callee);
  }

  return false;
};

const getRootIdentifierName = (node: any): string | undefined => {
  if (node?.type === 'Identifier' || node?.type === 'JSXIdentifier') {
    return node.name;
  }

  if (
    node?.type === 'MemberExpression' ||
    node?.type === 'JSXMemberExpression'
  ) {
    return getRootIdentifierName(node.object);
  }

  return undefined;
};

const getStaticStringValue = (node: any): string | undefined => {
  if (node?.type === 'Literal' && isString(node.value)) {
    return node.value;
  }

  if (node?.type === 'TemplateLiteral' && !isNonEmptyArray(node.expressions)) {
    return node.quasis[0].value.cooked;
  }

  return undefined;
};

const getCalledMethodName = (callee: any): string | undefined => {
  if (callee?.type !== 'MemberExpression' || callee.computed) {
    return undefined;
  }

  return callee.property?.type === 'Identifier'
    ? callee.property.name
    : undefined;
};

export const rule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow overriding twenty-ui components from the frontend outside the recorded exceptions.',
    },
    schema: [],
    messages: {
      styledTwentyUiComponent:
        'styled({{ componentName }}) restyles a twenty-ui component. Use a component prop, variant or part instead, or record the exception in no-twenty-ui-override.exemptions.ts.',
      stylingPropOnTwentyUiComponent:
        '{{ propName }} on {{ componentName }} restyles a twenty-ui component. Use a component prop, variant or part instead, or record the exception in no-twenty-ui-override.exemptions.ts.',
      privateCssVariableWrite:
        '{{ variableName }} is a private twenty-ui CSS variable. Use a component prop or a part className instead of writing it.',
      privateTwentyUiAttribute:
        '{{ attributeName }} is a private twenty-ui attribute. Use ARIA state, a public Base UI state attribute or a component prop instead.',
      doubleAmpersandSelector:
        '&& only raises specificity. twenty-ui styles sit in the twenty-ui cascade layer, so a plain declaration already wins.',
      importantDeclaration:
        '!important only raises priority. twenty-ui styles sit in the twenty-ui cascade layer, so a plain declaration already wins.',
    },
  },
  create: (context) => {
    if (isExemptFile(context.filename)) {
      return {};
    }

    const sourceCode = context.sourceCode;
    const twentyUiComponentLocalNames = new Set<string>();

    const isTwentyUiComponentReference = (node: any): boolean => {
      const rootIdentifierName = getRootIdentifierName(node);

      return (
        isDefined(rootIdentifierName) &&
        twentyUiComponentLocalNames.has(rootIdentifierName)
      );
    };

    const reportSourceRange = ({
      startOffset,
      length,
      messageId,
      data,
    }: {
      startOffset: number;
      length: number;
      messageId: string;
      data?: Record<string, string>;
    }) => {
      context.report({
        loc: {
          start: sourceCode.getLocFromIndex(startOffset),
          end: sourceCode.getLocFromIndex(startOffset + length),
        },
        messageId,
        data,
      });
    };

    const reportPrivateAttributeSelectors = ({
      node,
      allowOnStyledElement,
    }: {
      node: any;
      allowOnStyledElement: boolean;
    }) => {
      const nodeStartOffset = node.range[0];
      const nodeText = sourceCode.getText(node);

      for (const match of nodeText.matchAll(PRIVATE_ATTRIBUTE_SELECTOR_REGEX)) {
        const selectorTextBeforeAttribute = nodeText.slice(0, match.index);

        if (
          allowOnStyledElement &&
          SELECTOR_TEXT_ENDING_ON_STYLED_ELEMENT_REGEX.test(
            selectorTextBeforeAttribute,
          )
        ) {
          continue;
        }

        reportSourceRange({
          startOffset: nodeStartOffset + match.index,
          length: match[0].length,
          messageId: 'privateTwentyUiAttribute',
          data: { attributeName: match[0] },
        });
      }
    };

    const reportTemplateElementOverrides = (templateElement: any) => {
      const templateElementStartOffset = templateElement.range[0];
      const templateElementText = sourceCode.getText(templateElement);

      for (const match of templateElementText.matchAll(
        PRIVATE_CSS_VARIABLE_DECLARATION_REGEX,
      )) {
        reportSourceRange({
          startOffset: templateElementStartOffset + match.index,
          length: match[0].length,
          messageId: 'privateCssVariableWrite',
          data: { variableName: match[0] },
        });
      }

      for (const match of templateElementText.matchAll(
        DOUBLE_AMPERSAND_REGEX,
      )) {
        reportSourceRange({
          startOffset: templateElementStartOffset + match.index,
          length: match[0].length,
          messageId: 'doubleAmpersandSelector',
        });
      }

      for (const match of templateElementText.matchAll(IMPORTANT_REGEX)) {
        reportSourceRange({
          startOffset: templateElementStartOffset + match.index,
          length: match[0].length,
          messageId: 'importantDeclaration',
        });
      }

      reportPrivateAttributeSelectors({
        node: templateElement,
        allowOnStyledElement: true,
      });
    };

    const reportStyledTwentyUiComponentCall = (callExpression: any) => {
      const [styledComponent] = callExpression.arguments;

      if (
        callExpression.callee.type !== 'Identifier' ||
        callExpression.callee.name !== 'styled' ||
        !isTwentyUiComponentReference(styledComponent)
      ) {
        return;
      }

      context.report({
        node: styledComponent,
        messageId: 'styledTwentyUiComponent',
        data: { componentName: sourceCode.getText(styledComponent) },
      });
    };

    const reportElementQueryCall = (callExpression: any) => {
      const calledMethodName = getCalledMethodName(callExpression.callee);

      if (
        !isDefined(calledMethodName) ||
        !ELEMENT_QUERY_METHOD_NAMES.has(calledMethodName)
      ) {
        return;
      }

      for (const selectorArgument of callExpression.arguments) {
        if (
          selectorArgument.type !== 'Literal' &&
          selectorArgument.type !== 'TemplateLiteral'
        ) {
          continue;
        }

        reportPrivateAttributeSelectors({
          node: selectorArgument,
          allowOnStyledElement: false,
        });
      }
    };

    const reportPrivateCssVariableSetPropertyCall = (callExpression: any) => {
      const [propertyNameArgument] = callExpression.arguments;
      const propertyName = getStaticStringValue(propertyNameArgument);

      if (
        getCalledMethodName(callExpression.callee) !== 'setProperty' ||
        !isDefined(propertyName) ||
        !PRIVATE_CSS_VARIABLE_NAME_REGEX.test(propertyName)
      ) {
        return;
      }

      context.report({
        node: propertyNameArgument,
        messageId: 'privateCssVariableWrite',
        data: { variableName: propertyName },
      });
    };

    return {
      Program: (program: any) => {
        for (const statement of program.body) {
          if (
            statement.type !== 'ImportDeclaration' ||
            statement.importKind === 'type' ||
            !TWENTY_UI_COMPONENT_IMPORT_SOURCE_REGEX.test(
              statement.source.value,
            )
          ) {
            continue;
          }

          for (const specifier of statement.specifiers) {
            if (specifier.importKind === 'type') {
              continue;
            }

            twentyUiComponentLocalNames.add(specifier.local.name);
          }
        }
      },
      CallExpression: (callExpression: any) => {
        reportStyledTwentyUiComponentCall(callExpression);
        reportElementQueryCall(callExpression);
        reportPrivateCssVariableSetPropertyCall(callExpression);
      },
      Property: (property: any) => {
        const propertyName = getStaticStringValue(property.key);

        if (
          isDefined(propertyName) &&
          PRIVATE_CSS_VARIABLE_NAME_REGEX.test(propertyName)
        ) {
          context.report({
            node: property.key,
            messageId: 'privateCssVariableWrite',
            data: { variableName: propertyName },
          });
        }
      },
      TaggedTemplateExpression: (taggedTemplateExpression: any) => {
        if (!isLinariaTag(taggedTemplateExpression.tag)) {
          return;
        }

        for (const templateElement of taggedTemplateExpression.quasi.quasis) {
          reportTemplateElementOverrides(templateElement);
        }
      },
      JSXOpeningElement: (openingElement: any) => {
        if (!isTwentyUiComponentReference(openingElement.name)) {
          return;
        }

        for (const attribute of openingElement.attributes) {
          if (
            attribute.type !== 'JSXAttribute' ||
            attribute.name.type !== 'JSXIdentifier' ||
            !STYLING_PROP_NAME_REGEX.test(attribute.name.name)
          ) {
            continue;
          }

          context.report({
            node: attribute,
            messageId: 'stylingPropOnTwentyUiComponent',
            data: {
              propName: attribute.name.name,
              componentName: sourceCode.getText(openingElement.name),
            },
          });
        }
      },
    };
  },
});
