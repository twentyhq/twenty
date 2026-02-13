import * as prettier from '@prettier/sync';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { IndentationText, Project, QuoteKind } from 'ts-morph';

import { ALLOWED_HTML_ELEMENTS } from '../../src/sdk/front-component-api/constants/AllowedHtmlElements';
import { COMMON_HTML_EVENTS } from '../../src/sdk/front-component-api/constants/CommonHtmlEvents';
import { EVENT_TO_REACT } from '../../src/sdk/front-component-api/constants/EventToReact';
import { HTML_COMMON_PROPERTIES } from '../../src/sdk/front-component-api/constants/HtmlCommonProperties';

import {
  type ComponentSchema,
  extractHtmlTag,
  generateHostRegistry,
  generateRemoteComponents,
  generateRemoteElements,
  HtmlElementConfigArrayZ,
  OUTPUT_FILES,
} from './generators';
import {
  logCount,
  logDetail,
  logEmpty,
  logError,
  logFileWritten,
  logGroupLabel,
  logSectionHeader,
  logSeparator,
  logSuccess,
  logTitle,
  setVerbose,
} from './utils/logger';

const parseVerboseFlag = (): boolean => {
  return process.argv.includes('--verbose');
};

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_PATH = path.resolve(SCRIPT_DIR, '../..');
const FRONT_COMPONENT_PATH = path.join(PACKAGE_PATH, 'src/front-component-renderer');
const HOST_GENERATED_DIR = path.join(FRONT_COMPONENT_PATH, 'host/generated');
const REMOTE_GENERATED_DIR = path.join(
  FRONT_COMPONENT_PATH,
  'remote/generated',
);

const formatZodError = (error: {
  issues: { path: PropertyKey[]; message: string }[];
}): string => {
  return error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
};

const getHtmlElementSchemas = (): ComponentSchema[] => {
  const result = HtmlElementConfigArrayZ.safeParse(ALLOWED_HTML_ELEMENTS);

  if (!result.success) {
    throw new Error(
      `Invalid HTML element configuration:\n${formatZodError(result.error)}`,
    );
  }

  return result.data.map((element) => ({
    name: element.name,
    tagName: element.name,
    customElementName: element.tag,
    properties: {
      ...HTML_COMMON_PROPERTIES,
      ...element.properties,
    },
    events: COMMON_HTML_EVENTS,
    isHtmlElement: true,
    htmlTag: extractHtmlTag(element.tag),
  }));
};

const createProject = (): Project => {
  return new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
      useTrailingCommas: true,
    },
  });
};

const writeGeneratedFile = (
  dir: string,
  filename: string,
  content: string,
): void => {
  const filePath = path.join(dir, filename);
  const formattedContent = prettier.format(content, {
    parser: 'typescript',
    filepath: filePath,
    singleQuote: true,
    trailingComma: 'all',
    endOfLine: 'lf',
  });
  fs.writeFileSync(filePath, formattedContent, 'utf-8');
  logFileWritten(filePath);
};

const ensureDirectoriesExist = (): void => {
  if (!fs.existsSync(HOST_GENERATED_DIR)) {
    fs.mkdirSync(HOST_GENERATED_DIR, { recursive: true });
  }
  if (!fs.existsSync(REMOTE_GENERATED_DIR)) {
    fs.mkdirSync(REMOTE_GENERATED_DIR, { recursive: true });
  }
};

const main = (): void => {
  const verbose = parseVerboseFlag();
  setVerbose(verbose);

  logTitle('Remote DOM Elements Generator');

  let htmlElements: ComponentSchema[];

  try {
    htmlElements = getHtmlElementSchemas();
  } catch (error) {
    logError('Validation failed:', error);
    process.exit(1);
  }

  logSeparator();
  logSectionHeader('Summary');

  logCount('HTML Elements', htmlElements.length, 'element', 'elements');
  logDetail(
    `Tags: ${htmlElements.map((element) => element.htmlTag).join(', ')}`,
  );
  logDetail(`Events: ${COMMON_HTML_EVENTS.length} common events per element`);

  const allComponents = [...htmlElements];

  ensureDirectoriesExist();

  const project = createProject();

  logSeparator();
  logSectionHeader('Writing Files');

  logGroupLabel('Host');

  const hostRegistry = generateHostRegistry(
    project,
    allComponents,
    EVENT_TO_REACT,
  );
  writeGeneratedFile(
    HOST_GENERATED_DIR,
    OUTPUT_FILES.HOST_REGISTRY,
    hostRegistry.getFullText(),
  );

  logEmpty();
  logGroupLabel('Remote');

  const remoteElements = generateRemoteElements(
    project,
    allComponents,
    HTML_COMMON_PROPERTIES,
    COMMON_HTML_EVENTS,
  );
  writeGeneratedFile(
    REMOTE_GENERATED_DIR,
    OUTPUT_FILES.REMOTE_ELEMENTS,
    remoteElements.getFullText(),
  );

  const remoteComponents = generateRemoteComponents(project, allComponents);
  writeGeneratedFile(
    REMOTE_GENERATED_DIR,
    OUTPUT_FILES.REMOTE_COMPONENTS,
    remoteComponents.getFullText(),
  );

  logSeparator();
  logSuccess('Done!', 'All generated files created.');
  logDetail(`Host:   ${HOST_GENERATED_DIR}`);
  logDetail(`Remote: ${REMOTE_GENERATED_DIR}`);
  logEmpty();
};

main();
