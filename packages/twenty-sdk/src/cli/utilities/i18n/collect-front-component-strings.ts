import { readFile } from 'node:fs/promises';

import {
  Node,
  Project,
  type JsxElement,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
} from 'ts-morph';

import {
  getTranslationCatalogKey,
  normalizeMessageWhitespace,
  type MessageDescriptor,
} from '@/sdk/front-component/i18n/message';

const TRANSLATION_FUNCTION_NAMES = new Set(['t', 'msg']);
const TRANS_COMPONENT_NAME = 'Trans';

const getStringLiteralValue = (node: Node | undefined): string | undefined => {
  if (node === undefined) {
    return undefined;
  }

  if (
    Node.isStringLiteral(node) ||
    Node.isNoSubstitutionTemplateLiteral(node)
  ) {
    return node.getLiteralText();
  }

  return undefined;
};

// Reads t('message') / t({ message, context }) / msg(...) call arguments. Only
// static string literals are extractable — dynamic arguments are skipped.
const extractFromCallArgument = (
  argument: Node | undefined,
): MessageDescriptor | undefined => {
  if (argument === undefined) {
    return undefined;
  }

  const literalMessage = getStringLiteralValue(argument);

  if (literalMessage !== undefined) {
    return { message: literalMessage };
  }

  if (!Node.isObjectLiteralExpression(argument)) {
    return undefined;
  }

  const messageProperty = argument.getProperty('message');

  if (
    messageProperty === undefined ||
    !Node.isPropertyAssignment(messageProperty)
  ) {
    return undefined;
  }

  const message = getStringLiteralValue(messageProperty.getInitializer());

  if (message === undefined) {
    return undefined;
  }

  const contextProperty = argument.getProperty('context');
  const context =
    contextProperty !== undefined && Node.isPropertyAssignment(contextProperty)
      ? getStringLiteralValue(contextProperty.getInitializer())
      : undefined;

  return context !== undefined ? { message, context } : { message };
};

const getJsxAttributeStringValue = (
  element: JsxOpeningElement | JsxSelfClosingElement,
  name: string,
): string | undefined => {
  const attribute = element.getAttribute(name);

  if (attribute === undefined || !Node.isJsxAttribute(attribute)) {
    return undefined;
  }

  const initializer = attribute.getInitializer();

  if (initializer === undefined) {
    return undefined;
  }

  if (Node.isStringLiteral(initializer)) {
    return initializer.getLiteralText();
  }

  if (Node.isJsxExpression(initializer)) {
    return getStringLiteralValue(initializer.getExpression());
  }

  return undefined;
};

// <Trans>Static text</Trans>: only plain text children are extractable. Nested
// elements or interpolated expressions require the `message` prop instead.
const getTransChildrenText = (element: JsxElement): string | undefined => {
  const children = element.getJsxChildren();

  const hasDynamicChild = children.some(
    (child) =>
      Node.isJsxExpression(child) ||
      Node.isJsxElement(child) ||
      Node.isJsxSelfClosingElement(child),
  );

  if (hasDynamicChild) {
    return undefined;
  }

  const text = normalizeMessageWhitespace(
    children
      .filter((child) => Node.isJsxText(child))
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

// Statically scans front-component source for t()/msg()/<Trans> usages and
// returns the translatable messages (with optional disambiguation context).
export const collectFrontComponentStrings = async (
  sourceFilePaths: string[],
): Promise<MessageDescriptor[]> => {
  if (sourceFilePaths.length === 0) {
    return [];
  }

  const project = new Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
  });

  const descriptors: MessageDescriptor[] = [];

  for (let index = 0; index < sourceFilePaths.length; index++) {
    let content: string;

    try {
      content = await readFile(sourceFilePaths[index], 'utf8');
    } catch {
      continue;
    }

    const sourceFile = project.createSourceFile(
      `front-component-${index}.tsx`,
      content,
      { overwrite: true },
    );

    sourceFile.forEachDescendant((node) => {
      if (Node.isCallExpression(node)) {
        const expression = node.getExpression();

        if (
          Node.isIdentifier(expression) &&
          TRANSLATION_FUNCTION_NAMES.has(expression.getText())
        ) {
          const descriptor = extractFromCallArgument(node.getArguments()[0]);

          if (descriptor !== undefined) {
            descriptors.push(descriptor);
          }
        }

        return;
      }

      if (Node.isJsxSelfClosingElement(node)) {
        if (node.getTagNameNode().getText() !== TRANS_COMPONENT_NAME) {
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

      if (Node.isJsxElement(node)) {
        const openingElement = node.getOpeningElement();

        if (
          openingElement.getTagNameNode().getText() !== TRANS_COMPONENT_NAME
        ) {
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
    });
  }

  return dedupeByCatalogKey(descriptors);
};
