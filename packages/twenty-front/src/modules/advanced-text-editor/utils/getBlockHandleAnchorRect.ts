import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

const acceptFirstLineNode = (node: Node) =>
  (node.nodeType === Node.TEXT_NODE &&
    isNonEmptyString(node.textContent?.trim())) ||
  node.nodeName === 'BR'
    ? NodeFilter.FILTER_ACCEPT
    : NodeFilter.FILTER_SKIP;

const getFirstLineRect = (blockElement: HTMLElement) => {
  const firstLineNode = document
    .createTreeWalker(
      blockElement,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      { acceptNode: acceptFirstLineNode },
    )
    .nextNode();

  if (!isDefined(firstLineNode)) {
    return null;
  }

  const range = document.createRange();
  range.selectNode(firstLineNode);

  return range.getClientRects().item(0);
};

const TEXT_BLOCK_SELECTOR = doNotTranslate(
  'p, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote',
);

const getListItemOwningFirstLine = (blockElement: HTMLElement) => {
  if (blockElement instanceof HTMLLIElement) {
    return blockElement;
  }

  const parentElement = blockElement.parentElement;

  return parentElement instanceof HTMLLIElement &&
    parentElement.firstElementChild === blockElement
    ? parentElement
    : null;
};

const getBlockDecorationOwner = (blockElement: HTMLElement) => {
  const quoteElement = blockElement.closest('blockquote');

  if (isDefined(quoteElement)) {
    return quoteElement;
  }

  return (
    getListItemOwningFirstLine(blockElement)?.parentElement ?? blockElement
  );
};

type GetBlockHandleAnchorRectArgs = {
  blockElement: HTMLElement;
  handleHeight: number;
};

export const getBlockHandleAnchorRect = ({
  blockElement,
  handleHeight,
}: GetBlockHandleAnchorRectArgs) => {
  const blockRect = blockElement.getBoundingClientRect();
  const left =
    getBlockDecorationOwner(blockElement).getBoundingClientRect().left;
  const width = blockRect.right - left;
  const firstLineRect = blockElement.matches(TEXT_BLOCK_SELECTOR)
    ? getFirstLineRect(blockElement)
    : null;

  if (isDefined(firstLineRect)) {
    return new DOMRect(left, firstLineRect.top, width, firstLineRect.height);
  }

  return new DOMRect(
    left,
    blockRect.top,
    width,
    Math.min(blockRect.height, handleHeight),
  );
};
