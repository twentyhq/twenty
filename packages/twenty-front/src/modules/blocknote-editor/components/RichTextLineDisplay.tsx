import { type PartialBlock } from '@blocknote/core';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { LegacyMentionRenderer } from '@/blocknote-editor/components/LegacyMentionRenderer';

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
    if (!isDefined(block.content)) {
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
        if (typeof content === 'object' && content !== null) {
          const rawContent = content as Record<string, unknown>;

          if (rawContent.type === 'hardBreak') {
            return false;
          }

          if (
            'text' in rawContent &&
            typeof rawContent.text === 'string' &&
            rawContent.text.trim() !== ''
          ) {
            return true;
          }

          if (
            rawContent.type === 'mention' &&
            typeof rawContent.props === 'object' &&
            rawContent.props !== null
          ) {
            const props = rawContent.props as Record<string, unknown>;
            const hasLabel =
              typeof props.label === 'string' && props.label.trim() !== '';
            const hasRecordAndMetadata =
              typeof props.recordId === 'string' &&
              props.recordId.trim() !== '' &&
              typeof props.objectMetadataId === 'string' &&
              props.objectMetadataId.trim() !== '';

            return hasLabel || hasRecordAndMetadata;
          }

          if (rawContent.type === 'link' || 'link' in rawContent) {
            const hasHref =
              (typeof rawContent.href === 'string' &&
                rawContent.href.trim() !== '') ||
              (typeof rawContent.link === 'string' &&
                rawContent.link.trim() !== '');
            const hasText =
              typeof rawContent.text === 'string' &&
              rawContent.text.trim() !== '';
            const hasChildren =
              Array.isArray(rawContent.content) &&
              rawContent.content.length > 0;

            return hasHref || hasText || hasChildren;
          }
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
  if (!isDefined(block.content)) {
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
          const rawContent = content as Record<string, unknown>;

          if (rawContent.type === 'hardBreak') {
            return ' ';
          }

          if ('text' in rawContent && typeof rawContent.text === 'string') {
            return rawContent.text;
          }

          if (rawContent.type === 'link' && Array.isArray(rawContent.content)) {
            return rawContent.content
              .map((child: unknown) =>
                typeof child === 'object' &&
                child !== null &&
                'text' in child &&
                typeof (child as { text: unknown }).text === 'string'
                  ? (child as { text: string }).text
                  : '',
              )
              .join('');
          }

          if ('link' in rawContent && typeof rawContent.link === 'string') {
            return rawContent.link;
          }

          if (typeof rawContent.href === 'string') {
            return rawContent.href;
          }

          if (
            rawContent.type === 'mention' &&
            'props' in rawContent &&
            typeof rawContent.props === 'object' &&
            rawContent.props !== null
          ) {
            const props = rawContent.props as Record<string, unknown>;
            if (typeof props.label === 'string' && props.label !== '') {
              return `@${props.label}`;
            }
            return '@';
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

  const contentObj = content as Record<string, unknown>;

  if (contentObj.type === 'hardBreak') {
    return <span key={index}> </span>;
  }

  if (contentObj.type === 'mention') {
    const props = contentObj.props as Record<string, unknown> | undefined;
    const label = typeof props?.label === 'string' ? props.label : '';
    const recordId = typeof props?.recordId === 'string' ? props.recordId : '';
    const objectMetadataId =
      typeof props?.objectMetadataId === 'string' ? props.objectMetadataId : '';

    if (isNonEmptyString(label)) {
      return (
        <span key={index} style={{ fontWeight: 500 }}>
          @{label}
        </span>
      );
    }

    if (isNonEmptyString(recordId) && isNonEmptyString(objectMetadataId)) {
      return (
        <LegacyMentionRenderer
          key={index}
          recordId={recordId}
          objectMetadataId={objectMetadataId}
        />
      );
    }

    return (
      <span key={index} style={{ fontWeight: 500 }}>
        @
      </span>
    );
  }

  if (contentObj.type === 'link' || 'link' in contentObj) {
    const href =
      typeof contentObj.href === 'string'
        ? contentObj.href
        : typeof contentObj.link === 'string'
          ? contentObj.link
          : '';
    const linkText =
      typeof contentObj.text === 'string' ? contentObj.text : href;
    const linkContent = Array.isArray(contentObj.content)
      ? contentObj.content.map((child: unknown, childIndex: number) =>
          renderInlineContent(child, childIndex),
        )
      : linkText;

    return (
      <a
        key={index}
        href={href || undefined}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        style={{
          textDecoration: 'underline',
          color: themeCssVariables.font.color.secondary,
        }}
      >
        {linkContent}
      </a>
    );
  }

  if ('text' in contentObj && typeof contentObj.text === 'string') {
    const style = getInlineContentCssStyle(
      contentObj.styles as InlineStyles | undefined,
    );
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
