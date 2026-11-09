/* oxlint-disable twenty/no-hardcoded-colors --
   PDF documents are rendered outside the app and cannot read theme variables */
import { PDF_FONT_FAMILIES } from '@/command-menu-item/record/single-record/constants/PdfFontFamilies';
import { RICH_TEXT_PDF_COLORS } from '@/command-menu-item/record/single-record/constants/RichTextPdfColors';
import { fetchPdfImageBlob } from '@/command-menu-item/record/single-record/utils/fetchPdfImageBlob';
import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { type ComponentProps, type ReactNode } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  getSafeUrl,
  isDefined,
  isPlainObject,
  RICH_TEXT_COLORS,
  TIPTAP_MARK_TYPES,
  TIPTAP_NODE_TYPES,
  type TipTapDocument,
  type TipTapNode,
} from 'twenty-shared/utils';

const HEADING_FONT_SIZES = [22, 18, 15, 13, 12, 11];

const styles = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILIES.REGULAR,
    fontSize: 11,
    lineHeight: 1.5,
    padding: 48,
  },
  block: { marginBottom: 6 },
  listItem: { flexDirection: 'row', marginBottom: 2 },
  listMarker: { width: 18 },
  listContent: { flex: 1 },
  blockquote: {
    borderLeftColor: '#d6d6d6',
    borderLeftWidth: 3,
    color: '#646464',
    marginBottom: 6,
    paddingLeft: 10,
  },
  codeBlock: {
    backgroundColor: '#f4f4f4',
    fontFamily: PDF_FONT_FAMILIES.MONOSPACE,
    fontSize: 10,
    marginBottom: 6,
    padding: 8,
  },
  table: {
    borderColor: '#d6d6d6',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    marginBottom: 6,
  },
  tableRow: { flexDirection: 'row' },
  tableCell: {
    borderBottomWidth: 1,
    borderColor: '#d6d6d6',
    borderRightWidth: 1,
    flex: 1,
    padding: 4,
  },
  tableHeader: {
    backgroundColor: '#f4f4f4',
    fontFamily: PDF_FONT_FAMILIES.BOLD,
  },
  divider: { borderTopColor: '#d6d6d6', borderTopWidth: 1, marginVertical: 8 },
  image: { marginBottom: 6, maxWidth: '100%', objectFit: 'contain' },
  link: { color: '#0d74ce' },
});

type PdfTextStyle = Exclude<
  NonNullable<ComponentProps<typeof View>['style']>,
  unknown[]
>;

const findPdfColor = ({
  attributes,
  attributeName,
}: {
  attributes: unknown;
  attributeName: 'textColor' | 'backgroundColor';
}) => {
  const value = isPlainObject(attributes)
    ? attributes[attributeName]
    : undefined;
  const color = RICH_TEXT_COLORS.find(
    (richTextColor) => richTextColor === value,
  );

  return isDefined(color) ? RICH_TEXT_PDF_COLORS[color] : undefined;
};

// Unmarked text returns no font so it inherits a bold heading or table header.
const getMarkFontFamily = ({
  isCode,
  isBold,
  isItalic,
}: {
  isCode: boolean;
  isBold: boolean;
  isItalic: boolean;
}) => {
  if (isCode) {
    return PDF_FONT_FAMILIES.MONOSPACE;
  }

  if (isBold && isItalic) {
    return PDF_FONT_FAMILIES.BOLD_ITALIC;
  }

  if (isBold) {
    return PDF_FONT_FAMILIES.BOLD;
  }

  return isItalic ? PDF_FONT_FAMILIES.ITALIC : undefined;
};

const getTextDecoration = ({
  isUnderlined,
  isStruck,
}: {
  isUnderlined: boolean;
  isStruck: boolean;
}) => {
  if (isUnderlined && isStruck) {
    return doNotTranslate('underline line-through');
  }

  if (isUnderlined) {
    return 'underline';
  }

  return isStruck ? 'line-through' : undefined;
};

const getMarkStyle = (node: TipTapNode): PdfTextStyle => {
  const marks = node.marks ?? [];
  const hasMark = (type: string) => marks.some((mark) => mark.type === type);
  const textStyleAttributes = marks.find(
    (mark) => mark.type === TIPTAP_MARK_TYPES.TEXT_STYLE,
  )?.attrs;
  const textColor = findPdfColor({
    attributes: textStyleAttributes,
    attributeName: 'textColor',
  })?.text;
  const backgroundColor = findPdfColor({
    attributes: textStyleAttributes,
    attributeName: 'backgroundColor',
  })?.background;

  const fontFamily = getMarkFontFamily({
    isCode: hasMark(TIPTAP_MARK_TYPES.CODE),
    isBold: hasMark(TIPTAP_MARK_TYPES.BOLD),
    isItalic: hasMark(TIPTAP_MARK_TYPES.ITALIC),
  });
  const textDecoration = getTextDecoration({
    isUnderlined: hasMark(TIPTAP_MARK_TYPES.UNDERLINE),
    isStruck: hasMark(TIPTAP_MARK_TYPES.STRIKE),
  });

  return {
    ...(isDefined(fontFamily) ? { fontFamily } : {}),
    ...(isDefined(textDecoration) ? { textDecoration } : {}),
    ...(isDefined(textColor) ? { color: textColor } : {}),
    ...(isDefined(backgroundColor) ? { backgroundColor } : {}),
  };
};

const renderInline = (node: TipTapNode, key: number): ReactNode => {
  switch (node.type) {
    case TIPTAP_NODE_TYPES.TEXT: {
      const href = node.marks?.find(
        (mark) => mark.type === TIPTAP_MARK_TYPES.LINK,
      )?.attrs?.href;
      const safeHref = getSafeUrl(isNonEmptyString(href) ? href : undefined);
      const text = (
        <Text key={key} style={getMarkStyle(node)}>
          {node.text ?? ''}
        </Text>
      );

      return isDefined(safeHref) ? (
        <Link key={key} src={safeHref} style={styles.link}>
          {text}
        </Link>
      ) : (
        text
      );
    }
    case TIPTAP_NODE_TYPES.HARD_BREAK:
      return '\n';
    case TIPTAP_NODE_TYPES.MENTION_TAG:
      return `@${isNonEmptyString(node.attrs?.label) ? node.attrs.label : (node.attrs?.objectNameSingular ?? '')}`;
    case TIPTAP_NODE_TYPES.VARIABLE_TAG:
      return isNonEmptyString(node.attrs?.variable) ? node.attrs.variable : '';
    default:
      return (node.content ?? []).map(renderInline);
  }
};

const renderInlineContent = (node: TipTapNode) =>
  (node.content ?? []).map(renderInline);

const renderListItems = (list: TipTapNode, key: number) => {
  const start = isNumber(list.attrs?.start) ? list.attrs.start : 1;

  return (
    <View key={key} style={styles.block}>
      {(list.content ?? []).map((item, index) => {
        const marker =
          list.type === TIPTAP_NODE_TYPES.ORDERED_LIST
            ? `${start + index}.`
            : list.type === TIPTAP_NODE_TYPES.TASK_LIST
              ? item.attrs?.checked === true
                ? '[x]'
                : '[ ]'
              : '•';

        return (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listMarker}>{marker}</Text>
            <View style={styles.listContent}>
              {(item.content ?? []).map(renderBlock)}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const renderBlock = (node: TipTapNode, key: number): ReactNode => {
  switch (node.type) {
    case TIPTAP_NODE_TYPES.PARAGRAPH:
      return (
        <Text key={key} style={styles.block}>
          {renderInlineContent(node)}
        </Text>
      );
    case TIPTAP_NODE_TYPES.HEADING: {
      const level = isNumber(node.attrs?.level) ? node.attrs.level : 1;

      return (
        <Text
          key={key}
          style={[
            styles.block,
            {
              fontFamily: PDF_FONT_FAMILIES.BOLD,
              fontSize: HEADING_FONT_SIZES[level - 1] ?? 11,
            },
          ]}
        >
          {renderInlineContent(node)}
        </Text>
      );
    }
    case TIPTAP_NODE_TYPES.BULLET_LIST:
    case TIPTAP_NODE_TYPES.ORDERED_LIST:
    case TIPTAP_NODE_TYPES.TASK_LIST:
      return renderListItems(node, key);
    case TIPTAP_NODE_TYPES.BLOCKQUOTE:
      return (
        <View key={key} style={styles.blockquote}>
          {(node.content ?? []).map(renderBlock)}
        </View>
      );
    case TIPTAP_NODE_TYPES.CODE_BLOCK:
      return (
        <Text key={key} style={styles.codeBlock}>
          {(node.content ?? []).map((child) => child.text ?? '').join('')}
        </Text>
      );
    case TIPTAP_NODE_TYPES.TABLE:
      return (
        <View key={key} style={styles.table}>
          {(node.content ?? []).map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {(row.content ?? []).map((cell, cellIndex) => (
                <View
                  key={cellIndex}
                  style={
                    cell.type === TIPTAP_NODE_TYPES.TABLE_HEADER
                      ? [styles.tableCell, styles.tableHeader]
                      : styles.tableCell
                  }
                >
                  {(cell.content ?? []).map(renderBlock)}
                </View>
              ))}
            </View>
          ))}
        </View>
      );
    case TIPTAP_NODE_TYPES.IMAGE: {
      const src = node.attrs?.src;

      return isNonEmptyString(src) ? (
        <Image
          key={key}
          src={() => fetchPdfImageBlob(src)}
          style={styles.image}
        />
      ) : null;
    }
    case TIPTAP_NODE_TYPES.FILE: {
      const url = getSafeUrl(
        isNonEmptyString(node.attrs?.url) ? node.attrs.url : undefined,
      );
      const name = isNonEmptyString(node.attrs?.name) ? node.attrs.name : '';

      return isDefined(url) ? (
        <Link key={key} src={url} style={[styles.block, styles.link]}>
          {name || url}
        </Link>
      ) : (
        <Text key={key} style={styles.block}>
          {name}
        </Text>
      );
    }
    case TIPTAP_NODE_TYPES.DIVIDER:
      return <View key={key} style={styles.divider} />;
    default:
      return (node.content ?? []).map(renderBlock);
  }
};

type TipTapPdfDocumentProps = {
  document: TipTapDocument;
};

export const TipTapPdfDocument = ({ document }: TipTapPdfDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {(document.content ?? []).map(renderBlock)}
    </Page>
  </Document>
);
