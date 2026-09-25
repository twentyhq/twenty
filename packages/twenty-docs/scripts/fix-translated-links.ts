import fs from 'fs';
import path from 'path';

import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from '../navigation/supported-languages';
import { walkMdxFiles } from './walk-mdx-files';

// Crowdin hands translated pages back with the English link targets, so every
// internal link is re-pointed at the page's own language after each pull.
const DOCS_ROOT = path.resolve(__dirname, '..');

const LINKED_SECTIONS = [
  'getting-started',
  'user-guide',
  'developers',
  'twenty-ui',
  'ui',
];

export const localizeLinks = (content: string, language: string): string =>
  LINKED_SECTIONS.reduce(
    (result, section) =>
      result
        .replaceAll(`href="/${section}/`, `href="/${language}/${section}/`)
        .replaceAll(`](/${section}/`, `](/${language}/${section}/`)
        .replaceAll(
          `https://docs.twenty.com/${section}/`,
          `https://docs.twenty.com/${language}/${section}/`,
        ),
    content,
  );

const main = (): void => {
  for (const language of SUPPORTED_LANGUAGES) {
    const languageDirectory = path.join(DOCS_ROOT, language);

    if (language === DEFAULT_LANGUAGE || !fs.existsSync(languageDirectory)) {
      continue;
    }

    let changedFileCount = 0;

    for (const file of walkMdxFiles(languageDirectory)) {
      const content = fs.readFileSync(file, 'utf8');
      const localizedContent = localizeLinks(content, language);

      if (localizedContent !== content) {
        fs.writeFileSync(file, localizedContent);
        changedFileCount += 1;
      }
    }

    console.log(`${language}: fixed links in ${changedFileCount} file(s)`);
  }
};

if (require.main === module) {
  main();
}
