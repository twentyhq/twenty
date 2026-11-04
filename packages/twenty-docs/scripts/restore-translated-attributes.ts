import fs from 'fs';
import path from 'path';

import { isString, isUndefined } from '@sniptt/guards';
import {
  mdxJsxFromMarkdown,
  type MdxJsxAttribute,
  type MdxJsxFlowElement,
  type MdxJsxTextElement,
} from 'mdast-util-mdx-jsx';
import { mdxJsx } from 'micromark-extension-mdx-jsx';
import { mdxMd } from 'micromark-extension-mdx-md';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import { type Processor, unified } from 'unified';
import { visit } from 'unist-util-visit';

import { isDefined } from '../../twenty-shared/src/utils/validation/isDefined';
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '../navigation/supported-languages';
import { localizeLinks } from './fix-translated-links';
import { walkMdxFiles } from './walk-mdx-files';

const DOCS_ROOT = path.resolve(__dirname, '..');

const TRANSLATABLE_ATTRIBUTES = new Set([
  'alt',
  'caption',
  'description',
  'title',
]);

type JsxElement = MdxJsxFlowElement | MdxJsxTextElement;

type Replacement = {
  start: number;
  end: number;
  text: string;
};

type Restoration = {
  replacements: Replacement[];
  unrestoredCount: number;
};

const EMPTY_RESTORATION: Restoration = { replacements: [], unrestoredCount: 0 };

function remarkMdxJsxWithoutAcorn(this: Processor) {
  const data = this.data();

  (data.micromarkExtensions ??= []).push(mdxJsx(), mdxMd());
  (data.fromMarkdownExtensions ??= []).push(mdxJsxFromMarkdown());
}

const parser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkMdxJsxWithoutAcorn);

const isJsxElement = (node: { type: string }): node is JsxElement =>
  node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';

const collectElementsByName = (content: string): Map<string, JsxElement[]> => {
  const elementsByName = new Map<string, JsxElement[]>();

  visit(parser.parse(content), (node) => {
    if (!isJsxElement(node)) {
      return;
    }

    const name = node.name ?? '';

    elementsByName.set(name, [...(elementsByName.get(name) ?? []), node]);
  });

  return elementsByName;
};

const getRestorableAttributes = (element: JsxElement): MdxJsxAttribute[] =>
  element.attributes.filter(
    (attribute): attribute is MdxJsxAttribute =>
      attribute.type === 'mdxJsxAttribute' &&
      isDefined(attribute.value) &&
      !TRANSLATABLE_ATTRIBUTES.has(attribute.name),
  );

const getWhitespaceInsensitiveValue = (attribute: MdxJsxAttribute): string =>
  isString(attribute.value)
    ? attribute.value
    : `{${attribute.value?.value.replace(/\s+/g, '')}}`;

const getComparableValues = (
  element: JsxElement,
  language: SupportedLanguage,
): string[] =>
  getRestorableAttributes(element).map(
    (attribute) =>
      `${attribute.name}=${getWhitespaceInsensitiveValue(attribute).replace(
        new RegExp(`^(https://docs\\.twenty\\.com)?/${language}/`),
        '$1/',
      )}`,
  );

const findCounterpartIndex = ({
  translationValues,
  sourceValues,
  translationElementIndex,
  hasSameElementCount,
}: {
  translationValues: string[];
  sourceValues: string[][];
  translationElementIndex: number;
  hasSameElementCount: boolean;
}): number | undefined => {
  const translationValueSet = new Set(translationValues);
  const sharedCounts = sourceValues.map(
    (values) => values.filter((value) => translationValueSet.has(value)).length,
  );
  const bestCount = Math.max(...sharedCounts);
  const bestIndexes = sharedCounts.flatMap((count, sourceIndex) =>
    count === bestCount ? [sourceIndex] : [],
  );

  if (bestCount > 0 && bestIndexes.length === 1) {
    return bestIndexes[0];
  }

  return hasSameElementCount &&
    sharedCounts[translationElementIndex] === bestCount
    ? translationElementIndex
    : undefined;
};

const buildReplacement = ({
  attribute,
  counterpart,
  source,
  language,
}: {
  attribute: MdxJsxAttribute;
  counterpart: JsxElement | undefined;
  source: string;
  language: SupportedLanguage;
}): Replacement | undefined => {
  const sourceAttribute = isUndefined(counterpart)
    ? undefined
    : getRestorableAttributes(counterpart).find(
        (candidate) => candidate.name === attribute.name,
      );
  const start = attribute.position?.start.offset;
  const end = attribute.position?.end.offset;

  if (isUndefined(sourceAttribute) || isUndefined(start) || isUndefined(end)) {
    return undefined;
  }

  return {
    start,
    end,
    text: localizeLinks(
      source.slice(
        sourceAttribute.position?.start.offset,
        sourceAttribute.position?.end.offset,
      ),
      language,
    ),
  };
};

const mergeRestorations = (restorations: Restoration[]): Restoration => ({
  replacements: restorations.flatMap(({ replacements }) => replacements),
  unrestoredCount: restorations.reduce(
    (total, { unrestoredCount }) => total + unrestoredCount,
    0,
  ),
});

const restoreElementGroup = ({
  source,
  sourceElements,
  translationElements,
  language,
}: {
  source: string;
  sourceElements: JsxElement[];
  translationElements: JsxElement[];
  language: SupportedLanguage;
}): Restoration => {
  if (sourceElements.length === 0) {
    return EMPTY_RESTORATION;
  }

  const sourceValues = sourceElements.map((element) =>
    getComparableValues(element, language),
  );
  const knownValues = new Set(sourceValues.flat());

  return mergeRestorations(
    translationElements.map((translationElement, translationElementIndex) => {
      const translationValues = getComparableValues(
        translationElement,
        language,
      );
      const translatedAttributes = getRestorableAttributes(
        translationElement,
      ).filter(
        (_, attributeIndex) =>
          !knownValues.has(translationValues[attributeIndex]),
      );

      if (translatedAttributes.length === 0) {
        return EMPTY_RESTORATION;
      }

      const counterpartIndex = findCounterpartIndex({
        translationValues,
        sourceValues,
        translationElementIndex,
        hasSameElementCount:
          sourceElements.length === translationElements.length,
      });
      const replacements = translatedAttributes.flatMap(
        (attribute) =>
          buildReplacement({
            attribute,
            counterpart: isUndefined(counterpartIndex)
              ? undefined
              : sourceElements[counterpartIndex],
            source,
            language,
          }) ?? [],
      );

      return {
        replacements,
        unrestoredCount: translatedAttributes.length - replacements.length,
      };
    }),
  );
};

const applyReplacements = (
  content: string,
  replacements: Replacement[],
): string =>
  [...replacements]
    .sort((first, second) => second.start - first.start)
    .reduce(
      (result, { start, end, text }) =>
        `${result.slice(0, start)}${text}${result.slice(end)}`,
      content,
    );

export const restoreTranslatedAttributes = ({
  source,
  translation,
  language,
}: {
  source: string;
  translation: string;
  language: SupportedLanguage;
}): { content: string; restoredCount: number; unrestoredCount: number } => {
  const sourceElementsByName = collectElementsByName(source);
  const { replacements, unrestoredCount } = mergeRestorations(
    [...collectElementsByName(translation)].map(([name, translationElements]) =>
      restoreElementGroup({
        source,
        sourceElements: sourceElementsByName.get(name) ?? [],
        translationElements,
        language,
      }),
    ),
  );

  return {
    content: applyReplacements(translation, replacements),
    restoredCount: replacements.length,
    unrestoredCount,
  };
};

const restoreFile = ({
  file,
  languageDirectory,
  language,
}: {
  file: string;
  languageDirectory: string;
  language: SupportedLanguage;
}): number => {
  const sourceFile = path.join(
    DOCS_ROOT,
    path.relative(languageDirectory, file),
  );
  const relativePath = path.relative(DOCS_ROOT, file);

  if (!fs.existsSync(sourceFile)) {
    return 0;
  }

  try {
    const translation = fs.readFileSync(file, 'utf8');
    const restoration = restoreTranslatedAttributes({
      source: fs.readFileSync(sourceFile, 'utf8'),
      translation,
      language,
    });

    if (restoration.unrestoredCount > 0) {
      console.warn(
        `${relativePath}: ${restoration.unrestoredCount} attribute(s) differ from the English page and could not be matched to it`,
      );
    }

    if (restoration.content === translation) {
      return 0;
    }

    fs.writeFileSync(file, restoration.content);

    return restoration.restoredCount;
  } catch (error) {
    console.warn(
      `${relativePath}: skipped, could not parse (${error instanceof Error ? error.message : error})`,
    );

    return 0;
  }
};

const restoreLanguage = (language: SupportedLanguage): void => {
  const languageDirectory = path.join(DOCS_ROOT, language);
  const restoredCounts = walkMdxFiles(languageDirectory)
    .map((file) => restoreFile({ file, languageDirectory, language }))
    .filter((restoredCount) => restoredCount > 0);
  const restoredCount = restoredCounts.reduce(
    (total, count) => total + count,
    0,
  );

  console.log(
    `${language}: restored ${restoredCount} attribute(s) in ${restoredCounts.length} file(s)`,
  );
};

const main = (): void => {
  for (const language of SUPPORTED_LANGUAGES) {
    if (
      language !== DEFAULT_LANGUAGE &&
      fs.existsSync(path.join(DOCS_ROOT, language))
    ) {
      restoreLanguage(language);
    }
  }
};

if (require.main === module) {
  main();
}
