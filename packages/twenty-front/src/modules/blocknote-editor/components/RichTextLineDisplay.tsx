import { type PartialBlock } from '@blocknote/core';
import { styled } from '@linaria/react';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const BLOCKNOTE_TEXT_COLORS: Record<string, string> = {
  gray: themeCssVariables.color.gray,
  brown: themeCssVariables.color.brown,
  red: themeCssVariables.color.red,
  orange: themeCssVariables.color.orange,
  yellow: themeCssVariables.color.yellow,
  green: themeCssVariables.color.green,
  blue: themeCssVariables.color.blue,
  purple: themeCssVariables.color.purple,
  pink: themeCssVariables.color.pink,
};

const BLOCKNOTE_BACKGROUND_COLORS: Record<string, string> = {
  gray: themeCssVariables.color.gray3,
  brown: themeCssVariables.color.brown3,
  red: themeCssVariables.color.red3,
  orange: themeCssVariables.color.orange3,
  yellow: themeCssVariables.color.yellow3,
  green: themeCssVariables.color.green3,
  blue: themeCssVariables.color.blue3,
  purple: themeCssVariables.color.purple3,
  pink: themeCssVariables.color.pink3,
};

type InlineStyles = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  textColor?: string;
  backgroundColor?: string;
};

const getInlineContentCssStyle = (
  styles?: InlineStyles,
): React.CSSProperties => {
  if (!styles) {
    return {};
  }

  const cssStyle: React.CSSProperties = {};

  if (styles.bold) {
    cssStyle.fontWeight = 'bold';
  }

  if (styles.italic) {
    cssStyle.fontStyle = 'italic';
  }

  if (styles.strike && styles.underline) {
    cssStyle.textDecoration = 'underline line-through';
  } else if (styles.strike) {
    cssStyle.textDecoration = 'line-through';
  } else if (styles.underline) {
    cssStyle.textDecoration = 'underline';
  }

  if (styles.code) {
    cssStyle.fontFamily = 'monospace';
    cssStyle.padding = '0 2px';
  }

  if (styles.textColor && styles.textColor !== 'default') {
    cssStyle.color =
      BLOCKNOTE_TEXT_COLORS[styles.textColor] ?? styles.textColor;
  }

  if (styles.backgroundColor && styles.backgroundColor !== 'default') {
    cssStyle.backgroundColor =
      BLOCKNOTE_BACKGROUND_COLORS[styles.backgroundColor] ??
      styles.backgroundColor;
  }

  return cssStyle;
};

export const getFirstNonEmptyBlock = (
  blocks: PartialBlock[] | null,
): PartialBlock | null => {
  if (!isDefined(blocks) || blocks.length === 0) {
    return null;
  }

  for (const block of blocks) {
    if (isUndefinedOrNull(block.content)) {
      continue;
    }

    if (typeof block.content === 'string') {
      if (block.content.trim() !== '') {
        return block;
      }
      continue;
    }

    if (Array.isArray(block.content)) {
      const hasContent = block.content.some((content) => {
        if (typeof content === 'string') {
          return content.trim() !== '';
        }
        if (
          typeof content === 'object' &&
          content !== null &&
          'text' in content &&
          typeof content.text === 'string'
        ) {
          return content.text.trim() !== '';
        }
        if (
          typeof content === 'object' &&
          content !== null &&
          (content.type === 'link' ||
            'link' in content ||
            content.type === 'mention')
        ) {
          return true;
        }
        return false;
      });

      if (hasContent) {
        return block;
      }
    }
  }

  return null;
};

export const getBlockPlainText = (block: PartialBlock): string => {
  if (isUndefinedOrNull(block.content)) {
    return '';
  }

  if (typeof block.content === 'string') {
    return block.content;
  }

  if (Array.isArray(block.content)) {
    return block.content
      .map((content) => {
        if (typeof content === 'string') {
          return content;
        }
        if (typeof content === 'object' && content !== null) {
          if ('text' in content && typeof content.text === 'string') {
            return content.text;
          }
          if ('link' in content && typeof content.link === 'string') {
            return content.link;
          }
          if (content.type === 'link' && Array.isArray(content.content)) {
            return content.content
              .map((child: unknown) =>
                typeof child === 'object' && child !== null && 'text' in child
                  ? child.text
                  : '',
              )
              .join('');
          }
          if (
            content.type === 'mention' &&
            'props' in content &&
            typeof content.props === 'object' &&
            content.props !== null &&
            'label' in content.props &&
            typeof content.props.label === 'string'
          ) {
            return `@${content.props.label}`;
          }
        }
        return '';
      })
      .join('');
  }

  return '';
};

const renderInlineContent = (
  content: unknown,
  index: number,
): React.ReactNode => {
  if (typeof content === 'string') {
    return <span key={index}>{content}</span>;
  }

  if (!isDefined(content) || typeof content !== 'object') {
    return null;
  }

  const contentObj = content as Record<string, any>;

  if (contentObj.type === 'mention') {
    const label = contentObj.props?.label;
    return (
      <span key={index} style={{ fontWeight: 500 }}>
        @{label ?? ''}
      </span>
    );
  }

  if (contentObj.type === 'link' || 'link' in contentObj) {
    const href = contentObj.href ?? contentObj.link;
    const linkContent = Array.isArray(contentObj.content)
      ? contentObj.content.map((child: unknown, childIndex: number) =>
          renderInlineContent(child, childIndex),
        )
      : (contentObj.text ?? href ?? '');

    return (
      <span
        key={index}
        style={{
          textDecoration: 'underline',
          color: themeCssVariables.font.color.secondary,
        }}
      >
        {linkContent}
      </span>
    );
  }

  if ('text' in contentObj && typeof contentObj.text === 'string') {
    const style = getInlineContentCssStyle(contentObj.styles);
    return (
      <span key={index} style={style}>
        {contentObj.text}
      </span>
    );
  }

  return null;
};

const StyledContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type RichTextLineDisplayProps = {
  blocks: PartialBlock[] | null;
  className?: string;
};

export const RichTextLineDisplay = ({
  blocks,
  className,
}: RichTextLineDisplayProps) => {
  const firstNonEmptyBlock = getFirstNonEmptyBlock(blocks);

  if (!isDefined(firstNonEmptyBlock)) {
    return null;
  }

  const plainText = getBlockPlainText(firstNonEmptyBlock);

  return (
    <StyledContainer className={className} title={plainText}>
      {typeof firstNonEmptyBlock.content === 'string'
        ? firstNonEmptyBlock.content
        : Array.isArray(firstNonEmptyBlock.content)
          ? firstNonEmptyBlock.content.map((content, index) =>
              renderInlineContent(content, index),
            )
          : null}
    </StyledContainer>
  );
};
