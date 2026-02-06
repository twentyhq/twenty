import type { Project, SourceFile } from 'ts-morph';

import { isDefined } from 'twenty-shared/utils';
import { CUSTOM_ELEMENT_NAMES } from './constants';
import { type ComponentSchema } from './schemas';
import { addFileHeader, addStatement } from './utils';

const generateRuntimeUtilities = (
  eventToReactMapping: Record<string, string>,
): string => {
  const eventMapEntries = Object.entries(eventToReactMapping)
    .map(([domEvent, reactProp]) => `  on${domEvent}: '${reactProp}',`)
    .join('\n');

  return `const INTERNAL_PROPS = new Set(['element', 'receiver', 'components']);

const EVENT_NAME_MAP: Record<string, string> = {
${eventMapEntries}
};

const parseStyle = (styleString: string | undefined): React.CSSProperties | undefined => {
  if (!styleString || typeof styleString !== 'string') {
    return styleString as React.CSSProperties | undefined;
  }

  const style: Record<string, string> = {};
  const declarations = styleString.split(';').filter(Boolean);

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;

    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();

    const camelProperty = property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    style[camelProperty] = value;
  }

  return style;
};

const wrapEventHandler = (handler: () => void) => {
  return (_event: unknown) => {
    handler();
  };
};

const filterProps = (props: Record<string, unknown>) => {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (INTERNAL_PROPS.has(key) || value === undefined) continue;

    if (key === 'style') {
      filtered.style = parseStyle(value as string | undefined);
    } else {
      const normalizedKey = EVENT_NAME_MAP[key.toLowerCase()] || key;
      if (normalizedKey.startsWith('on') && typeof value === 'function') {
        filtered[normalizedKey] = wrapEventHandler(value as () => void);
      } else {
        filtered[normalizedKey] = value;
      }
    }
  }
  return filtered;
};`;
};

// HTML void elements cannot have children
// https://developer.mozilla.org/en-US/docs/Glossary/Void_element
const VOID_ELEMENTS = new Set([
  'input',
  'br',
  'hr',
  'img',
  'area',
  'base',
  'col',
  'embed',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

const generateHtmlWrapperComponent = (component: ComponentSchema): string => {
  const isVoidElement = VOID_ELEMENTS.has(component.htmlTag ?? '');

  if (isVoidElement) {
    return `const ${component.name}Wrapper = ({ children: _children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('${component.htmlTag}', filterProps(props));
};`;
  }

  return `const ${component.name}Wrapper = ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement('${component.htmlTag}', filterProps(props), children);
};`;
};

const generateUiWrapperComponent = (component: ComponentSchema): string => {
  return `const ${component.name}Wrapper = ({ children, ...props }: { children?: React.ReactNode } & Record<string, unknown>) => {
  return React.createElement(${component.componentImport}, filterProps(props), children);
};`;
};

const generateWrapperComponent = (component: ComponentSchema): string => {
  if (component.isHtmlElement) {
    return generateHtmlWrapperComponent(component);
  }
  return generateUiWrapperComponent(component);
};

const generateRegistryMap = (components: ComponentSchema[]): string => {
  const entries = components
    .map(
      (component) =>
        `  ['${component.customElementName}', createRemoteComponentRenderer(${component.name}Wrapper)],`,
    )
    .join('\n');

  return `type ComponentRegistryValue =
  | ReturnType<typeof createRemoteComponentRenderer>
  | typeof RemoteFragmentRenderer;

export const componentRegistry: Map<string, ComponentRegistryValue> = new Map([
${entries}
  ['${CUSTOM_ELEMENT_NAMES.FRAGMENT}', RemoteFragmentRenderer],
]);`;
};

const groupImportsByPath = (
  components: ComponentSchema[],
): Map<string, string[]> => {
  const importsByPath = new Map<string, string[]>();

  for (const component of components) {
    if (
      !component.isHtmlElement &&
      isDefined(component.componentPath) &&
      isDefined(component.componentImport)
    ) {
      const existing = importsByPath.get(component.componentPath) ?? [];
      if (!existing.includes(component.componentImport)) {
        existing.push(component.componentImport);
      }
      importsByPath.set(component.componentPath, existing);
    }
  }

  return importsByPath;
};

export const generateHostRegistry = (
  project: Project,
  components: ComponentSchema[],
  eventToReactMapping: Record<string, string>,
): SourceFile => {
  const sourceFile = project.createSourceFile(
    'host-component-registry.ts',
    '',
    { overwrite: true },
  );

  sourceFile.addImportDeclaration({
    moduleSpecifier: 'react',
    defaultImport: 'React',
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@remote-dom/react/host',
    namedImports: ['RemoteFragmentRenderer', 'createRemoteComponentRenderer'],
  });

  const uiImports = groupImportsByPath(components);

  for (const [modulePath, namedImports] of uiImports) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: modulePath,
      namedImports,
    });
  }

  addStatement(sourceFile, generateRuntimeUtilities(eventToReactMapping));

  for (const component of components) {
    addStatement(sourceFile, generateWrapperComponent(component));
  }

  addStatement(sourceFile, generateRegistryMap(components));

  addFileHeader(sourceFile);

  return sourceFile;
};
