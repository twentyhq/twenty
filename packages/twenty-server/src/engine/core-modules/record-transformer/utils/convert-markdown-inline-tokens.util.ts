import type { DefaultStyleSchema, Link, StyledText } from '@blocknote/core';
import { type Token } from 'marked';
import { isDefined, isNonEmptyArray, isSafeUrl } from 'twenty-shared/utils';

type InlineStyle = 'bold' | 'italic' | 'strike' | 'code';

export type InlineContent =
  | StyledText<DefaultStyleSchema>
  | Link<DefaultStyleSchema>;

type InlineRun = {
  text: string;
  styles: InlineStyle[];
  href?: string;
};

const STYLE_BY_TOKEN_TYPE: Record<string, InlineStyle> = {
  strong: 'bold',
  em: 'italic',
  del: 'strike',
};

export const getChildTokens = (token: Token): Token[] =>
  'tokens' in token && Array.isArray(token.tokens) ? token.tokens : [];

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
        runs.push({ text: token.text, styles: ['code'] });
        break;
      case 'br':
        runs.push({ text: '\n', styles, href });
        break;
      case 'link':
        collectInlineRuns({
          tokens: getChildTokens(token),
          styles,
          href: isSafeUrl(token.href) ? token.href : href,
          runs,
        });
        break;
      case 'image':
        runs.push({
          text: token.text.length > 0 ? token.text : token.href,
          styles,
          href: isSafeUrl(token.href) ? token.href : href,
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

export const convertMarkdownInlineTokens = (
  tokens: Token[],
): InlineContent[] => {
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

  const content: InlineContent[] = [];

  for (const run of mergedRuns) {
    const styledText: StyledText<DefaultStyleSchema> = {
      type: 'text',
      text: run.text,
      styles: Object.fromEntries(run.styles.map((style) => [style, true])),
    };
    const lastContent = content[content.length - 1];

    if (!isDefined(run.href)) {
      content.push(styledText);
    } else if (lastContent?.type === 'link' && lastContent.href === run.href) {
      lastContent.content.push(styledText);
    } else {
      content.push({ type: 'link', href: run.href, content: [styledText] });
    }
  }

  return content;
};
