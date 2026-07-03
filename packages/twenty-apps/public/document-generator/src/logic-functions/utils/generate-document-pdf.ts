// A tiny, dependency-free PDF writer for simple text documents.
//
// Logic functions are bundled and run in a sandbox, so pulling a large PDF
// library (and installing it at cold start) is overkill for plain-text output.
// This emits a valid multi-page PDF using the built-in Courier fonts — no
// embedding, no dependencies — which any PDF viewer can open.

const PAGE_WIDTH = 595.28; // A4, in points
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const TITLE_SIZE = 18;
const BODY_SIZE = 11;
const LINE_HEIGHT = 15;
const COURIER_ADVANCE = 0.6; // Courier glyph advance, in ems

// Courier is fixed-width, so a line fits if its character count stays under this.
const charsPerLine = (fontSize: number): number =>
  Math.floor((PAGE_WIDTH - MARGIN * 2) / (fontSize * COURIER_ADVANCE));

// Reduce text to the printable ASCII the standard Courier encoding can render.
const toAscii = (text: string): string =>
  text
    .normalize('NFKD')
    .replace(/[‐-―]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7e]/g, '');

// Escape the characters that are special inside a PDF literal string.
const escapePdfString = (text: string): string =>
  text.replace(/([\\()])/g, '\\$1');

const wrap = (line: string, maxChars: number): string[] => {
  if (line.length <= maxChars) {
    return [line];
  }

  const words = line.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxChars || current === '') {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  lines.push(current);

  return lines.flatMap((wrapped) =>
    wrapped.length <= maxChars
      ? [wrapped]
      : (wrapped.match(new RegExp(`.{1,${maxChars}}`, 'g')) ?? [wrapped]),
  );
};

type RenderedLine = { text: string; size: number; font: 'F1' | 'F2' };

const layout = (title: string, content: string): RenderedLine[] => {
  const lines: RenderedLine[] = [];

  for (const wrapped of wrap(toAscii(title), charsPerLine(TITLE_SIZE))) {
    lines.push({ text: wrapped, size: TITLE_SIZE, font: 'F2' });
  }
  lines.push({ text: '', size: BODY_SIZE, font: 'F1' });

  // Split on newlines first — toAscii() would otherwise strip them as control
  // characters and collapse every paragraph onto a single line.
  for (const rawLine of content.split('\n')) {
    const asciiLine = toAscii(rawLine);
    if (asciiLine.trim() === '') {
      lines.push({ text: '', size: BODY_SIZE, font: 'F1' });
      continue;
    }
    for (const wrapped of wrap(asciiLine, charsPerLine(BODY_SIZE))) {
      lines.push({ text: wrapped, size: BODY_SIZE, font: 'F1' });
    }
  }

  return lines;
};

// Splits the rendered lines into pages, each a PDF content stream.
const buildPageStreams = (lines: RenderedLine[]): string[] => {
  const pages: string[] = [];
  let stream = '';
  let cursorY = PAGE_HEIGHT - MARGIN;

  for (const line of lines) {
    if (cursorY < MARGIN) {
      pages.push(stream);
      stream = '';
      cursorY = PAGE_HEIGHT - MARGIN;
    }
    if (line.text !== '') {
      stream +=
        `BT /${line.font} ${line.size} Tf ` +
        `1 0 0 1 ${MARGIN} ${cursorY.toFixed(2)} Tm ` +
        `(${escapePdfString(line.text)}) Tj ET\n`;
    }
    cursorY -= line.size >= TITLE_SIZE ? line.size + 8 : LINE_HEIGHT;
  }

  pages.push(stream);

  return pages;
};

// Renders a title + plain-text body into a paginated A4 PDF. Pure and
// dependency-free, so it can be unit-tested directly.
export const generateDocumentPdf = (title: string, content: string): Uint8Array => {
  const pageStreams = buildPageStreams(layout(title, content));

  const objects: string[] = [];
  const pageCount = pageStreams.length;

  // Object 1: catalog, 2: pages tree, 3/4: fonts, then page + content pairs.
  const firstPageObjectNumber = 5;
  const kids = pageStreams
    .map((_stream, index) => `${firstPageObjectNumber + index * 2} 0 R`)
    .join(' ');

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>';
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>';

  pageStreams.forEach((stream, index) => {
    const pageNumber = firstPageObjectNumber + index * 2;
    const contentNumber = pageNumber + 1;

    objects[pageNumber] =
      `<< /Type /Page /Parent 2 0 R ` +
      `/MediaBox [0 0 ${PAGE_WIDTH.toFixed(2)} ${PAGE_HEIGHT.toFixed(2)}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> ` +
      `/Contents ${contentNumber} 0 R >>`;
    objects[contentNumber] =
      `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
  });

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  for (let number = 1; number < objects.length; number++) {
    offsets[number] = pdf.length;
    pdf += `${number} 0 obj\n${objects[number]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  const total = objects.length; // objects are 1-indexed, index 0 unused

  pdf += `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let number = 1; number < total; number++) {
    pdf += `${String(offsets[number]).padStart(10, '0')} 00000 n \n`;
  }
  pdf +=
    `trailer\n<< /Size ${total} /Root 1 0 R >>\n` +
    `startxref\n${xrefOffset}\n%%EOF`;

  return Uint8Array.from(Buffer.from(pdf, 'latin1'));
};
