import { createElement, type ReactElement } from 'react';

import {
  Document,
  type DocumentProps,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import {
  LIBERATION_SANS_BOLD_BASE64,
  LIBERATION_SANS_REGULAR_BASE64,
} from 'src/engine/core-modules/dpa/pdf/fonts/liberation-sans.fonts';
import { type ResolvedDpa } from 'src/engine/core-modules/dpa/types/dpa.types';

// createElement (not JSX) because the twenty-server swc builder has tsx disabled (syntax: 'typescript').
// Liberation Sans is embedded because react-pdf's built-in fonts only encode ASCII; the legal text's curly
// quotes, dashes and accented Latin otherwise throw an "unsupported number" glyph-metric error.
const FONT_FAMILY = 'Liberation Sans';

let fontsRegistered = false;

const registerFontsOnce = (): void => {
  if (fontsRegistered) {
    return;
  }

  Font.register({
    family: FONT_FAMILY,
    fonts: [
      {
        src: `data:font/ttf;base64,${LIBERATION_SANS_REGULAR_BASE64}`,
        fontWeight: 'normal',
      },
      {
        src: `data:font/ttf;base64,${LIBERATION_SANS_BOLD_BASE64}`,
        fontWeight: 'bold',
      },
    ],
  });

  fontsRegistered = true;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  notice: {
    borderWidth: 1.5,
    borderColor: '#b00020',
    borderStyle: 'solid',
    backgroundColor: '#fdecef',
    color: '#b00020',
    fontWeight: 'bold',
    fontSize: 10,
    padding: 8,
    marginBottom: 14,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  lastUpdated: { fontSize: 9, color: '#555555', marginBottom: 16 },
  heading: { fontSize: 11, fontWeight: 'bold', marginTop: 14, marginBottom: 4 },
  paragraph: { marginBottom: 6, textAlign: 'justify' },
  signatureField: { marginBottom: 8 },
  signatureLabel: { fontWeight: 'bold', marginBottom: 2 },
  signatureValue: { color: '#333333' },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 56,
    right: 56,
    fontSize: 7,
    color: '#888888',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const renderBlock = (
  block: ResolvedDpa['blocks'][number],
  index: number,
): ReactElement => {
  if (block.kind === 'heading') {
    return createElement(
      Text,
      { key: index, style: styles.heading },
      block.text,
    );
  }

  if (block.kind === 'signatureField') {
    const valueLines = (block.value ?? '')
      .split('\n')
      .filter((line) => line.trim() !== '');

    return createElement(
      View,
      { key: index, style: styles.signatureField, wrap: false },
      createElement(Text, { style: styles.signatureLabel }, block.label),
      ...valueLines.map((line, lineIndex) =>
        createElement(
          Text,
          { key: lineIndex, style: styles.signatureValue },
          line,
        ),
      ),
    );
  }

  return createElement(
    Text,
    { key: index, style: styles.paragraph },
    block.text,
  );
};

export const buildDpaPdfDocumentElement = (
  resolved: ResolvedDpa,
): ReactElement<DocumentProps> => {
  registerFontsOnce();

  const noticeBlock =
    resolved.notice !== undefined
      ? createElement(
          View,
          { style: styles.notice, wrap: false },
          createElement(Text, {}, resolved.notice),
        )
      : null;

  // Static footer (no "Page x / y"): @react-pdf/renderer 4.x throws "unsupported number" for a bottom-fixed
  // element with a dynamic `render` prop in a multi-page document.
  const footer = createElement(
    View,
    { style: styles.footer, fixed: true },
    createElement(
      Text,
      {},
      `${resolved.title} — template version ${resolved.templateVersion}`,
    ),
    createElement(Text, {}, `Last Updated: ${resolved.lastUpdatedLabel}`),
  );

  const page = createElement(
    Page,
    { size: 'A4', style: styles.page, wrap: true },
    noticeBlock,
    createElement(Text, { style: styles.title }, resolved.title),
    createElement(
      Text,
      { style: styles.lastUpdated },
      `Last Updated: ${resolved.lastUpdatedLabel}`,
    ),
    ...resolved.blocks.map((block, index) => renderBlock(block, index)),
    footer,
  );

  return createElement(
    Document,
    {
      title: resolved.title,
      author: resolved.values.PROCESSOR_ENTITY,
      subject: `DPA template version ${resolved.templateVersion}`,
    },
    page,
  ) as ReactElement<DocumentProps>;
};
