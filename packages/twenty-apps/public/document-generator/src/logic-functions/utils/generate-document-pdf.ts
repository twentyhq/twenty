import { marked, type Token, type Tokens } from 'marked';
import {
  type PDFFont,
  type PDFPage,
  PDFDocument,
  rgb,
  StandardFonts,
} from 'pdf-lib';

// Renders a document (title + Markdown body) into a marketable, multi-page A4
// PDF using pdf-lib: a coloured header band, real typography, bold/italic runs,
// headings and lists.

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 64;
const BODY_SIZE = 11;
const LINE_HEIGHT = 16;

const ACCENT = rgb(0.098, 0.38, 0.929); // #1961ED
const INK = rgb(0.06, 0.08, 0.16);
const MUTED = rgb(0.28, 0.31, 0.42);

type Fonts = {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
  mono: PDFFont;
};

type Ctx = {
  pdf: PDFDocument;
  page: PDFPage;
  y: number;
  fonts: Fonts;
};

type Run = { text: string; bold: boolean; italic: boolean; code: boolean; link: boolean };

// The built-in fonts use WinAnsi encoding and throw on characters they can't
// encode. Map common punctuation and drop anything outside Latin-1 so the PDF
// never fails (HTML surfaces still render the full text). Non-Latin scripts
// (CJK, Arabic, Cyrillic) would need an embedded Unicode font.
const toWinAnsi = (text: string): string =>
  text
    .replace(/[‐-―]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[^ -~ -ÿ]/g, '');

const pickFont = (fonts: Fonts, run: Run): PDFFont => {
  if (run.code) return fonts.mono;
  if (run.bold && run.italic) return fonts.boldItalic;
  if (run.bold) return fonts.bold;
  if (run.italic) return fonts.italic;
  return fonts.regular;
};

// Flatten marked inline tokens into styled runs.
const toRuns = (
  tokens: Token[] | undefined,
  style: Omit<Run, 'text'>,
): Run[] => {
  if (!tokens) return [];

  return tokens.flatMap((token): Run[] => {
    switch (token.type) {
      case 'strong':
        return toRuns((token as Tokens.Strong).tokens, { ...style, bold: true });
      case 'em':
        return toRuns((token as Tokens.Em).tokens, { ...style, italic: true });
      case 'link':
        return toRuns((token as Tokens.Link).tokens, { ...style, link: true });
      case 'codespan':
        return [{ ...style, code: true, text: (token as Tokens.Codespan).text }];
      case 'br':
        return [{ ...style, text: '\n' }];
      default: {
        // List items (and other block wrappers) expose their inline formatting
        // via nested `.tokens`; recurse so bold/italic inside them still render.
        const nested = (token as Tokens.Text).tokens;
        if (Array.isArray(nested) && nested.length > 0) {
          return toRuns(nested, style);
        }
        const text = (token as Tokens.Text).text ?? (token as { raw?: string }).raw ?? '';
        return text ? [{ ...style, text }] : [];
      }
    }
  });
};

const EMPTY_STYLE = { bold: false, italic: false, code: false, link: false };

const newPage = (ctx: Ctx) => {
  ctx.page = ctx.pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  ctx.y = PAGE_HEIGHT - MARGIN;
};

const ensureSpace = (ctx: Ctx, needed: number) => {
  if (ctx.y - needed < MARGIN) newPage(ctx);
};

// Word-wraps styled runs across lines, switching font per run, and draws them.
const drawRuns = (
  ctx: Ctx,
  runs: Run[],
  options: { size: number; indent?: number; lineHeight?: number },
) => {
  const { size } = options;
  const indent = options.indent ?? 0;
  const lineHeight = options.lineHeight ?? LINE_HEIGHT;
  const left = MARGIN + indent;
  const maxRight = PAGE_WIDTH - MARGIN;

  type Word = { text: string; font: PDFFont; color: ReturnType<typeof rgb> };
  const words: (Word | 'break')[] = [];

  for (const run of runs) {
    const font = pickFont(ctx.fonts, run);
    const color = run.link ? ACCENT : run.code ? MUTED : INK;
    // Split on newlines first: `toWinAnsi` drops the `\n`, so sanitizing before
    // splitting would swallow explicit line breaks.
    const segments = run.text.split('\n');

    segments.forEach((segment, index) => {
      if (index > 0) words.push('break');
      for (const word of toWinAnsi(segment).split(/(\s+)/)) {
        if (word === '') continue;
        words.push({ text: word, font, color });
      }
    });
  }

  ensureSpace(ctx, lineHeight);
  let cursorX = left;

  const wrap = () => {
    ctx.y -= lineHeight;
    ensureSpace(ctx, 0);
    if (ctx.y < MARGIN) newPage(ctx);
    cursorX = left;
  };

  for (const word of words) {
    if (word === 'break') {
      wrap();
      continue;
    }
    const isSpace = /^\s+$/.test(word.text);
    const width = word.font.widthOfTextAtSize(word.text, size);

    if (!isSpace && cursorX + width > maxRight && cursorX > left) {
      wrap();
    }
    if (isSpace && cursorX === left) continue;

    if (!isSpace) {
      ctx.page.drawText(word.text, {
        x: cursorX,
        y: ctx.y,
        size,
        font: word.font,
        color: word.color,
      });
    }
    cursorX += width;
  }

  ctx.y -= lineHeight;
};

const drawBlocks = (ctx: Ctx, tokens: Token[], indent = 0) => {
  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const heading = token as Tokens.Heading;
        const size = heading.depth === 1 ? 18 : heading.depth === 2 ? 15 : 13;
        ctx.y -= 8;
        drawRuns(
          ctx,
          toRuns(heading.tokens, { ...EMPTY_STYLE, bold: true }),
          { size, indent, lineHeight: size + 6 },
        );
        break;
      }
      case 'paragraph': {
        drawRuns(ctx, toRuns((token as Tokens.Paragraph).tokens, EMPTY_STYLE), {
          size: BODY_SIZE,
          indent,
        });
        ctx.y -= 6;
        break;
      }
      case 'list': {
        const list = token as Tokens.List;
        list.items.forEach((item, index) => {
          const marker = list.ordered ? `${(list.start || 1) + index}.` : '•';
          ensureSpace(ctx, LINE_HEIGHT);
          ctx.page.drawText(marker, {
            x: MARGIN + indent + 8,
            y: ctx.y,
            size: BODY_SIZE,
            font: ctx.fonts.regular,
            color: MUTED,
          });
          drawRuns(ctx, toRuns(item.tokens, EMPTY_STYLE), {
            size: BODY_SIZE,
            indent: indent + 28,
          });
        });
        ctx.y -= 6;
        break;
      }
      case 'blockquote': {
        const top = ctx.y;
        drawBlocks(ctx, (token as Tokens.Blockquote).tokens, indent + 20);
        ctx.page.drawRectangle({
          x: MARGIN + indent,
          y: ctx.y,
          width: 3,
          height: top - ctx.y,
          color: ACCENT,
        });
        break;
      }
      case 'code': {
        for (const line of (token as Tokens.Code).text.split('\n')) {
          drawRuns(ctx, [{ ...EMPTY_STYLE, code: true, text: line || ' ' }], {
            size: BODY_SIZE - 1,
            indent: indent + 8,
            lineHeight: 14,
          });
        }
        ctx.y -= 6;
        break;
      }
      case 'hr': {
        ensureSpace(ctx, 20);
        ctx.y -= 8;
        ctx.page.drawLine({
          start: { x: MARGIN, y: ctx.y },
          end: { x: PAGE_WIDTH - MARGIN, y: ctx.y },
          thickness: 1,
          color: rgb(0.9, 0.92, 0.96),
        });
        ctx.y -= 16;
        break;
      }
      case 'space':
        ctx.y -= 8;
        break;
      default: {
        const text = (token as { text?: string }).text;
        if (text) {
          drawRuns(ctx, [{ ...EMPTY_STYLE, text }], { size: BODY_SIZE, indent });
        }
      }
    }
  }
};

export const generateDocumentPdf = async (
  title: string,
  content: string,
): Promise<Uint8Array> => {
  const pdf = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await pdf.embedFont(StandardFonts.HelveticaBoldOblique),
    mono: await pdf.embedFont(StandardFonts.Courier),
  };

  const ctx: Ctx = { pdf, page: pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]), y: 0, fonts };

  // Header band with the document title.
  const bandHeight = 96;
  ctx.page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - bandHeight,
    width: PAGE_WIDTH,
    height: bandHeight,
    color: ACCENT,
  });
  ctx.page.drawText(toWinAnsi(title), {
    x: MARGIN,
    y: PAGE_HEIGHT - 58,
    size: 22,
    font: fonts.bold,
    color: rgb(1, 1, 1),
    maxWidth: PAGE_WIDTH - MARGIN * 2,
  });
  ctx.y = PAGE_HEIGHT - bandHeight - 40;

  // Match the HTML renderer (breaks: true) so a single newline in a template
  // becomes a line break in the PDF too.
  drawBlocks(ctx, marked.lexer(content, { breaks: true, gfm: true }));

  return pdf.save();
};
