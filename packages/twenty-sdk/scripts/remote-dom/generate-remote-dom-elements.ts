import * as prettier from '@prettier/sync';
import * as fs from 'fs';
import * as path from 'path';
import { IndentationText, Project, QuoteKind } from 'ts-morph';
import { fileURLToPath } from 'url';

import { ALLOWED_HTML_ELEMENTS } from '../../src/sdk/front-component-api/constants/AllowedHtmlElements';
import { COMMON_HTML_EVENTS } from '../../src/sdk/front-component-api/constants/CommonHtmlEvents';
import { HTML_COMMON_PROPERTIES } from '../../src/sdk/front-component-api/constants/HtmlCommonProperties';

import {
  type ComponentSchema,
  generateHostRegistry,
  generateRemoteComponents,
  generateRemoteElements,
  HtmlElementConfigArrayZ,
  OUTPUT_FILES,
} from './generators';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_PATH = path.resolve(SCRIPT_DIR, '../..');
const FRONT_COMPONENT_PATH = path.join(
  PACKAGE_PATH,
  'src/front-component-renderer',
);
const HOST_GENERATED_DIR = path.join(FRONT_COMPONENT_PATH, 'host/generated');
const REMOTE_GENERATED_DIR = path.join(
  FRONT_COMPONENT_PATH,
  'remote/generated',
);

const extractHtmlTag = (tag: string): string => tag.slice(5);

const getHtmlElementSchemas = (): ComponentSchema[] => {
  const result = HtmlElementConfigArrayZ.safeParse(ALLOWED_HTML_ELEMENTS);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid HTML element configuration:\n${details}`);
  }

  return result.data.map((element) => ({
    name: element.name,
    customElementName: element.tag,
    properties: {
      ...HTML_COMMON_PROPERTIES,
      ...element.properties,
    },
    events: COMMON_HTML_EVENTS,
    htmlTag: extractHtmlTag(element.tag),
  }));
};

const getUtilityComponentSchemas = (): ComponentSchema[] => [
  {
    name: 'RemoteStyle',
    customElementName: 'remote-style',
    properties: {
      cssText: { type: 'string', optional: true },
      styleKey: { type: 'string', optional: true },
    },
    events: [],
    customHostRenderer: 'RemoteStyleRenderer',
    customHostRendererPath: '../components/RemoteStyleRenderer',
  },
];

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
};

const main = (): void => {
  const htmlElements = getHtmlElementSchemas();
  const utilityComponents = getUtilityComponentSchemas();
  const allComponents = [...htmlElements, ...utilityComponents];

  fs.mkdirSync(HOST_GENERATED_DIR, { recursive: true });
  fs.mkdirSync(REMOTE_GENERATED_DIR, { recursive: true });

  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
      useTrailingCommas: true,
    },
  });

  const hostRegistry = generateHostRegistry(project, allComponents);
  writeGeneratedFile(
    HOST_GENERATED_DIR,
    OUTPUT_FILES.HOST_REGISTRY,
    hostRegistry.getFullText(),
  );

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
};

main();
