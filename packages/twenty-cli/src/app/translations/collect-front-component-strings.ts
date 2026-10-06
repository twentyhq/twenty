import { readFile } from 'node:fs/promises';

import * as ts from 'typescript';

import {
  getTranslationCatalogKey,
  normalizeMessageWhitespace,
  type MessageDescriptor,
} from '@/app/translations/message';

const TRANSLATION_FUNCTION_NAMES = new Set(['t', 'msg']);
const TRANS_COMPONENT_NAME = 'Trans';

const getStringLiteralValue = (
  node: ts.Node | undefined,
): string | undefined => {
  if (node === undefined) {
    return undefined;
  }

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  return undefined;
};

// Only static string literals are extractable; dynamic arguments are skipped.
const extractFromCallArgument = (
  argument: ts.Node | undefined,
): MessageDescriptor | undefined => {
  if (argument === undefined) {
    return undefined;
  }

  const literalMessage = getStringLiteralValue(argument);

  if (literalMessage !== undefined) {
    return { message: literalMessage };
  }

  if (!ts.isObjectLiteralExpression(argument)) {
    return undefined;
  }

  const messageProperty = argument.properties.find(
    (property) =>
      property.name !== undefined &&
      ts.isIdentifier(property.name) &&
      property.name.text === 'message',
  );

  if (
    messageProperty === undefined ||
    !ts.isPropertyAssignment(messageProperty)
  ) {
    return undefined;
  }

  const message = getStringLiteralValue(messageProperty.initializer);

  if (message === undefined) {
    return undefined;
  }

  const contextProperty = argument.properties.find(
    (property) =>
      property.name !== undefined &&
      ts.isIdentifier(property.name) &&
      property.name.text === 'context',
  );
  const context =
    contextProperty !== undefined && ts.isPropertyAssignment(contextProperty)
      ? getStringLiteralValue(contextProperty.initializer)
      : undefined;

  return context !== undefined ? { message, context } : { message };
};

const getJsxAttributeStringValue = (
  element: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
  name: string,
): string | undefined => {
  const attribute = element.attributes.properties.find(
    (property) =>
      ts.isJsxAttribute(property) && property.name.getText() === name,
  );

  if (attribute === undefined || !ts.isJsxAttribute(attribute)) {
    return undefined;
  }

  const initializer = attribute.initializer;

  if (initializer === undefined) {
    return undefined;
  }

  if (ts.isStringLiteral(initializer)) {
    return initializer.text;
  }

  if (ts.isJsxExpression(initializer)) {
    return getStringLiteralValue(initializer.expression);
  }

  return undefined;
};

const getTransChildrenText = (element: ts.JsxElement): string | undefined => {
  const children = element.children;

  const hasDynamicChild = children.some(
    (child) =>
      ts.isJsxExpression(child) ||
      ts.isJsxElement(child) ||
      ts.isJsxSelfClosingElement(child),
  );

  if (hasDynamicChild) {
    return undefined;
  }

  const text = normalizeMessageWhitespace(
    children
      .filter((child) => ts.isJsxText(child))
      .map((child) => child.getText())
      .join(''),
  );

  return text.length > 0 ? text : undefined;
};

const dedupeByCatalogKey = (
  descriptors: MessageDescriptor[],
): MessageDescriptor[] => {
  const descriptorByKey = new Map<string, MessageDescriptor>();

  for (const descriptor of descriptors) {
    descriptorByKey.set(
      getTranslationCatalogKey(descriptor.message, descriptor.context),
      descriptor,
    );
  }

  return [...descriptorByKey.values()];
};

export const collectFrontComponentStrings = async (
  sourceFilePaths: string[],
): Promise<MessageDescriptor[]> => {
  if (sourceFilePaths.length === 0) {
    return [];
  }

  const descriptors: MessageDescriptor[] = [];

  for (let index = 0; index < sourceFilePaths.length; index++) {
    let content: string;

    try {
      content = await readFile(sourceFilePaths[index], 'utf8');
    } catch {
      continue;
    }

    const sourceFile = ts.createSourceFile(
      `front-component-${index}.tsx`,
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    const collectFromNode = (node: ts.Node): void => {
      if (ts.isCallExpression(node)) {
        const expression = node.expression;

        if (
          ts.isIdentifier(expression) &&
          TRANSLATION_FUNCTION_NAMES.has(expression.text)
        ) {
          const descriptor = extractFromCallArgument(node.arguments[0]);

          if (descriptor !== undefined) {
            descriptors.push(descriptor);
          }
        }

        return;
      }

      if (ts.isJsxSelfClosingElement(node)) {
        if (node.tagName.getText() !== TRANS_COMPONENT_NAME) {
          return;
        }

        const message = getJsxAttributeStringValue(node, 'message');

        if (message !== undefined && message.length > 0) {
          const context = getJsxAttributeStringValue(node, 'context');

          descriptors.push(
            context !== undefined ? { message, context } : { message },
          );
        }

        return;
      }

      if (ts.isJsxElement(node)) {
        const openingElement = node.openingElement;

        if (openingElement.tagName.getText() !== TRANS_COMPONENT_NAME) {
          return;
        }

        const message =
          getJsxAttributeStringValue(openingElement, 'message') ??
          getTransChildrenText(node);

        if (message !== undefined && message.length > 0) {
          const context = getJsxAttributeStringValue(openingElement, 'context');

          descriptors.push(
            context !== undefined ? { message, context } : { message },
          );
        }
      }
    };

    const visit = (node: ts.Node): void => {
      collectFromNode(node);
      ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);
  }

  return dedupeByCatalogKey(descriptors);
};
