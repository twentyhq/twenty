import * as prettier from '@prettier/sync';
import * as fs from 'fs';
import * as path from 'path';
import { IndentationText, Project, QuoteKind } from 'ts-morph';

import { ALLOWED_HTML_ELEMENTS } from '../../src/sdk/front-component-common/AllowedHtmlElements';
import { ALLOWED_UI_COMPONENTS } from '../../src/sdk/front-component-common/AllowedUiComponents';
import { COMMON_HTML_EVENTS } from '../../src/sdk/front-component-common/CommonHtmlEvents';
import { EVENT_TO_REACT } from '../../src/sdk/front-component-common/EventToReact';
import { HTML_COMMON_PROPERTIES } from '../../src/sdk/front-component-common/HtmlCommonProperties';

import {
  type ComponentSchema,
  extractHtmlTag,
  generateHostRegistry,
  generateRemoteComponents,
  generateRemoteElements,
  HtmlElementConfigArrayZ,
  OUTPUT_FILES,
  UiComponentConfigArrayZ,
} from './generators';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const PACKAGE_PATH = path.resolve(SCRIPT_DIR, '../..');
const FRONT_COMPONENT_PATH = path.join(PACKAGE_PATH, 'src/front-component');
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

const getUiComponentSchemas = (): ComponentSchema[] => {
  const result = UiComponentConfigArrayZ.safeParse(ALLOWED_UI_COMPONENTS);

  if (!result.success) {
    throw new Error(
      `Invalid UI component configuration:\n${formatZodError(result.error)}`,
    );
  }

  return result.data.map((component) => ({
    name: component.name,
    tagName: component.name,
    customElementName: component.tag,
    properties: component.properties,
    events: COMMON_HTML_EVENTS,
    isHtmlElement: false,
    htmlTag: undefined,
    componentImport: component.componentImport,
    componentPath: component.componentPath,
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
  console.log(`✓ Generated ${filePath}`);
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
  console.log('📖 Generating remote DOM elements...\n');

  let htmlElements: ComponentSchema[];
  let uiComponents: ComponentSchema[];

  try {
    htmlElements = getHtmlElementSchemas();
    uiComponents = getUiComponentSchemas();
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }

  console.log(`HTML Elements: ${htmlElements.length} elements`);
  console.log(
    `  Tags: ${htmlElements.map((element) => element.htmlTag).join(', ')}`,
  );
  console.log(
    `  Events: ${COMMON_HTML_EVENTS.length} common events per element`,
  );

  console.log(`\nUI Components: ${uiComponents.length} components`);
  console.log(
    `  Tags: ${uiComponents.map((component) => component.customElementName).join(', ')}`,
  );
  console.log('');

  const allComponents = [...htmlElements, ...uiComponents];

  ensureDirectoriesExist();

  const project = createProject();

  console.log('Host files:');
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

  console.log('\nRemote files:');
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

  console.log('\n✅ All generated files created');
  console.log(`   Host: ${HOST_GENERATED_DIR}`);
  console.log(`   Remote: ${REMOTE_GENERATED_DIR}`);
};

main();
