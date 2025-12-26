import fs from 'fs';
import path from 'path';

import {
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
} from '../navigation/supported-languages';

type BasePage = string | BaseGroup;

type BaseGroup = {
  key: string;
  label: string;
  icon?: string;
  pages: BasePage[];
};

type BaseTab = {
  key: string;
  label: string;
  groups: BaseGroup[];
};

type BaseStructure = {
  tabs: BaseTab[];
};

type TranslationGroupEntry = {
  label: string;
  groups?: Record<string, TranslationGroupEntry>;
};

type TranslationTabEntry = {
  label: string;
  groups: Record<string, TranslationGroupEntry>;
};

type TranslationFile = {
  tabs: Record<string, TranslationTabEntry>;
};

type TranslationMaps = {
  tabLabels: Map<string, string>;
  groupLabels: Map<string, string>;
};

type GeneratedLanguage = {
  language: string;
  tabs: Array<{
    tab: string;
    groups: GeneratedGroup[];
  }>;
};

type GeneratedGroup = {
  group: string;
  icon?: string;
  pages: Array<string | GeneratedGroup>;
};

const baseStructurePath = path.resolve(
  __dirname,
  '../navigation/base-structure.json',
);
const docsPath = path.resolve(__dirname, '../docs.json');
const localesRoot = path.resolve(__dirname, '../l');

const baseStructure: BaseStructure = JSON.parse(
  fs.readFileSync(baseStructurePath, 'utf8'),
);

const docsConfig = JSON.parse(fs.readFileSync(docsPath, 'utf8'));

const collectTranslations = (
  file: TranslationFile | null,
): TranslationMaps => {
  const tabLabels = new Map<string, string>();
  const groupLabels = new Map<string, string>();

  const collectGroups = (
    groups?: Record<string, TranslationGroupEntry>,
  ) => {
    if (!groups) {
      return;
    }

    Object.entries(groups).forEach(([key, group]) => {
      groupLabels.set(key, group.label);
      collectGroups(group.groups);
    });
  };

  Object.entries(file?.tabs ?? {}).forEach(([key, tab]) => {
    tabLabels.set(key, tab.label);
    collectGroups(tab.groups);
  });

  return { tabLabels, groupLabels };
};

const loadTranslationFile = (language: string): TranslationFile | null => {
  const translationPath = path.join(
    localesRoot,
    language,
    'navigation.json',
  );

  if (!fs.existsSync(translationPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(translationPath, 'utf8')) as TranslationFile;
};

const buildLanguageEntry = (language: string): GeneratedLanguage => {
  const translationFile =
    language === DEFAULT_LANGUAGE ? null : loadTranslationFile(language);
  const translationMaps = collectTranslations(translationFile);

  return {
    language,
    tabs: baseStructure.tabs.map((tab) => ({
      tab: translationMaps.tabLabels.get(tab.key) ?? tab.label,
      groups: tab.groups.map((group) =>
        buildGroup(group, translationMaps, language),
      ),
    })),
  };
};

const buildGroup = (
  group: BaseGroup,
  translations: TranslationMaps,
  language: string,
): GeneratedGroup => ({
  group: translations.groupLabels.get(group.key) ?? group.label,
  ...(group.icon ? { icon: group.icon } : {}),
  pages: group.pages.map((page) =>
    typeof page === 'string'
      ? formatPageSlug(page, language)
      : buildGroup(page, translations, language),
  ),
});

const formatPageSlug = (slug: string, language: string): string =>
  language === DEFAULT_LANGUAGE ? slug : `l/${language}/${slug}`;

const hasLocaleContent = (language: string): boolean => {
  if (language === DEFAULT_LANGUAGE) {
    return true;
  }

  const localeDir = path.join(localesRoot, language);
  return fs.existsSync(localeDir);
};

const languages = SUPPORTED_LANGUAGES.filter(hasLocaleContent).map(
  buildLanguageEntry,
);

if (!docsConfig.navigation) {
  docsConfig.navigation = {};
}

docsConfig.navigation.languages = languages;

fs.writeFileSync(docsPath, `${JSON.stringify(docsConfig, null, 2)}\n`);

