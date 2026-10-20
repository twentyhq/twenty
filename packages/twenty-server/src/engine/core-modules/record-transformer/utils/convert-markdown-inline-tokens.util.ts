import { type Token, type Tokens } from 'marked';
import {
  convertTextToTipTapNodes,
  isDefined,
  isNonEmptyArray,
  isStorableRichTextUrl,
  TIPTAP_MARK_TYPES,
  type TipTapMark,
  type TipTapNode,
} from 'twenty-shared/utils';

type InlineStyle =
  | typeof TIPTAP_MARK_TYPES.BOLD
  | typeof TIPTAP_MARK_TYPES.ITALIC
  | typeof TIPTAP_MARK_TYPES.STRIKE
  | typeof TIPTAP_MARK_TYPES.CODE;

type InlineRun = {
  text: string;
  styles: InlineStyle[];
  href?: string;
};

const STYLE_BY_TOKEN_TYPE: Record<string, InlineStyle> = {
  strong: TIPTAP_MARK_TYPES.BOLD,
  em: TIPTAP_MARK_TYPES.ITALIC,
  del: TIPTAP_MARK_TYPES.STRIKE,
};

export const getChildTokens = (token: Token): Token[] =>
  'tokens' in token && Array.isArray(token.tokens) ? token.tokens : [];

export const isImageToken = (token: Token): token is Tokens.Image =>
  token.type === 'image' && isStorableRichTextUrl(token.href);

export const splitAroundImages = (token: Token): Token[] => {
  const childTokens = getChildTokens(token);

  if (isImageToken(token) || !isNonEmptyArray(childTokens)) {
    return [token];
  }

  const parts: Token[] = [];
  let pendingChildTokens: Token[] = [];

  const flushChildTokens = () => {
    if (pendingChildTokens.length > 0) {
      const partToken: Tokens.Generic = {
        ...token,
        tokens: pendingChildTokens,
      };

      parts.push(partToken);
      pendingChildTokens = [];
    }
  };

  for (const childPart of childTokens.flatMap(splitAroundImages)) {
    if (isImageToken(childPart)) {
      flushChildTokens();
      parts.push(childPart);
    } else {
      pendingChildTokens.push(childPart);
    }
  }

  flushChildTokens();

  return parts;
};

const collectInlineRuns = ({
  tokens,
  styles,
  href,
  runs,
}: {
  tokens: Token[];
  styles: InlineStyle[];
  href?: string;
  runs: InlineRun[];
}): void => {
  for (const token of tokens) {
    const style = STYLE_BY_TOKEN_TYPE[token.type];

    if (isDefined(style)) {
      collectInlineRuns({
        tokens: getChildTokens(token),
        styles: [...styles, style],
        href,
        runs,
      });
      continue;
    }

    switch (token.type) {
      case 'text':
        if (isNonEmptyArray(token.tokens)) {
          collectInlineRuns({ tokens: token.tokens, styles, href, runs });
        } else {
          runs.push({ text: token.text, styles, href });
        }
        break;
      case 'escape':
        runs.push({ text: token.text, styles, href });
        break;
      case 'codespan':
        runs.push({ text: token.text, styles: [TIPTAP_MARK_TYPES.CODE] });
        break;
      case 'br':
        runs.push({ text: '\n', styles, href });
        break;
      case 'link':
        collectInlineRuns({
          tokens: getChildTokens(token),
          styles,
          href: isStorableRichTextUrl(token.href) ? token.href : href,
          runs,
        });
        break;
      case 'image':
        runs.push({
          text: token.text.length > 0 ? token.text : token.href,
          styles,
          href: isStorableRichTextUrl(token.href) ? token.href : href,
        });
        break;
      case 'checkbox':
        break;
      default:
        runs.push({ text: token.raw, styles, href });
    }
  }
};

const isSameRunFormat = (firstRun: InlineRun, secondRun: InlineRun) =>
  firstRun.href === secondRun.href &&
  firstRun.styles.length === secondRun.styles.length &&
  firstRun.styles.every((style) => secondRun.styles.includes(style));

const convertRunToMarks = (run: InlineRun): TipTapMark[] => {
  const marks: TipTapMark[] = run.styles.map((style) => ({ type: style }));

  if (isDefined(run.href)) {
    marks.push({ type: TIPTAP_MARK_TYPES.LINK, attrs: { href: run.href } });
  }

  return marks;
};

export const convertMarkdownInlineTokens = (tokens: Token[]): TipTapNode[] => {
  const runs: InlineRun[] = [];

  collectInlineRuns({ tokens, styles: [], runs });

  const mergedRuns: InlineRun[] = [];

  for (const run of runs) {
    const lastRun = mergedRuns[mergedRuns.length - 1];

    if (run.text.length === 0) {
      continue;
    }

    if (isDefined(lastRun) && isSameRunFormat(lastRun, run)) {
      lastRun.text += run.text;
    } else {
      mergedRuns.push({ ...run });
    }
  }

  return mergedRuns.flatMap((run) =>
    convertTextToTipTapNodes(run.text, convertRunToMarks(run)),
  );
};
