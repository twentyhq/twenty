import fs from 'fs';
import path from 'path';

// Crowdin parses `<foo>` in prose as a tag rather than literal text, so an angle
// bracket placeholder is either dropped or mangled in every translated page.
// Curly braces `{foo}` survive the round trip.
//
// Usage:
//   tsx packages/twenty-docs/scripts/lint-mdx.ts

const DOCS_ROOT = path.resolve(__dirname, '..');

// `l/` holds the Crowdin pull output. A violation there is a symptom of a
// violation in the English source, and is not editable by hand.
const IGNORED_DIRECTORIES = ['node_modules', 'l', 'images', 'scripts'];

// The placeholder pattern only matches a lowercase name of two or more
// characters, so single-letter elements and capitalised components cannot
// reach this list.
const HTML_ELEMENTS = [
  'abbr',
  'article',
  'aside',
  'blockquote',
  'br',
  'button',
  'cite',
  'code',
  'dd',
  'del',
  'details',
  'div',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'li',
  'main',
  'mark',
  'nav',
  'ol',
  'option',
  'picture',
  'pre',
  'samp',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
  'var',
  'video',
];

const PLACEHOLDER_PATTERN = /<([a-z][a-z0-9_-]+)>/g;

const URL_PREFIX_PATTERN = /https?:\/\/$/;

export type MdxViolation = {
  line: number;
  column: number;
  text: string;
  name: string;
};

type Range = {
  start: number;
  end: number;
};

const getFencedCodeRanges = (text: string): Range[] => {
  const ranges: Range[] = [];
  let searchStart = 0;

  while (true) {
    const openIndex = text.indexOf('```', searchStart);

    if (openIndex === -1) {
      break;
    }

    const closeIndex = text.indexOf('```', openIndex + 3);

    if (closeIndex === -1) {
      break;
    }

    ranges.push({ start: openIndex, end: closeIndex + 3 });
    searchStart = closeIndex + 3;
  }

  return ranges;
};

const isInsideRange = (position: number, ranges: Range[]) =>
  ranges.some((range) => position >= range.start && position < range.end);

// Backtick runs are paired within a line, never across one. A running parity
// counter would let a single unpaired backtick silently suppress every finding
// in the rest of the file.
const getInlineCodeRanges = (text: string, fencedRanges: Range[]): Range[] => {
  const ranges: Range[] = [];
  let lineStart = 0;

  for (const line of text.split('\n')) {
    const runs: { start: number; length: number }[] = [];

    for (const match of line.matchAll(/`+/g)) {
      const start = lineStart + match.index;

      if (!isInsideRange(start, fencedRanges)) {
        runs.push({ start, length: match[0].length });
      }
    }

    const unclosed: typeof runs = [];

    for (const run of runs) {
      const openerIndex = unclosed.findIndex(
        (candidate) => candidate.length === run.length,
      );

      if (openerIndex === -1) {
        unclosed.push(run);
        continue;
      }

      ranges.push({
        start: unclosed[openerIndex].start,
        end: run.start + run.length,
      });
      unclosed.splice(0, openerIndex + 1);
    }

    lineStart += line.length + 1;
  }

  return ranges;
};

const getLineAndColumn = (text: string, position: number) => {
  const precedingText = text.slice(0, position);
  const lines = precedingText.split('\n');

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
};

export const findAngleBracketPlaceholders = (text: string): MdxViolation[] => {
  const fencedRanges = getFencedCodeRanges(text);
  const inlineCodeRanges = getInlineCodeRanges(text, fencedRanges);
  const violations: MdxViolation[] = [];

  for (const match of text.matchAll(PLACEHOLDER_PATTERN)) {
    const name = match[1];
    const position = match.index;

    // Directly after a scheme there is no markup, so even a real element name
    // is standing in for a host.
    const isUrlPlaceholder = URL_PREFIX_PATTERN.test(text.slice(0, position));

    if (HTML_ELEMENTS.includes(name) && !isUrlPlaceholder) {
      continue;
    }

    if (
      isInsideRange(position, fencedRanges) ||
      isInsideRange(position, inlineCodeRanges)
    ) {
      continue;
    }

    violations.push({
      ...getLineAndColumn(text, position),
      text: match[0],
      name,
    });
  }

  return violations;
};

const collectMdxFiles = (directory: string, collected: string[] = []) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (IGNORED_DIRECTORIES.includes(entry.name)) {
      continue;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectMdxFiles(entryPath, collected);
    } else if (entry.name.endsWith('.mdx')) {
      collected.push(entryPath);
    }
  }

  return collected;
};

const main = () => {
  const files = collectMdxFiles(DOCS_ROOT);
  let violationCount = 0;

  for (const file of files) {
    const violations = findAngleBracketPlaceholders(
      fs.readFileSync(file, 'utf8'),
    );

    for (const violation of violations) {
      const relativePath = path.relative(DOCS_ROOT, file);

      console.error(
        `${relativePath}:${violation.line}:${violation.column}  ${violation.text} reads as a tag in Crowdin, use {${violation.name}} instead`,
      );
    }

    violationCount += violations.length;
  }

  if (violationCount > 0) {
    console.error(
      `\n${violationCount} angle bracket placeholder(s) found in ${files.length} MDX files.`,
    );
    process.exit(1);
  }

  console.log(`No angle bracket placeholders in ${files.length} MDX files.`);
};

if (require.main === module) {
  main();
}
