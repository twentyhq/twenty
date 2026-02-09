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

const serializeEvent = (event: unknown): SerializedEventData => {
  if (!event || typeof event !== 'object') {
    return { type: 'unknown' };
  }

  const domEvent = event as Record<string, unknown>;
  const serialized: SerializedEventData = {
    type: typeof domEvent.type === 'string' ? domEvent.type : 'unknown',
  };

  if ('altKey' in domEvent) serialized.altKey = domEvent.altKey as boolean;
  if ('ctrlKey' in domEvent) serialized.ctrlKey = domEvent.ctrlKey as boolean;
  if ('metaKey' in domEvent) serialized.metaKey = domEvent.metaKey as boolean;
  if ('shiftKey' in domEvent) serialized.shiftKey = domEvent.shiftKey as boolean;

  if ('clientX' in domEvent) serialized.clientX = domEvent.clientX as number;
  if ('clientY' in domEvent) serialized.clientY = domEvent.clientY as number;
  if ('pageX' in domEvent) serialized.pageX = domEvent.pageX as number;
  if ('pageY' in domEvent) serialized.pageY = domEvent.pageY as number;
  if ('screenX' in domEvent) serialized.screenX = domEvent.screenX as number;
  if ('screenY' in domEvent) serialized.screenY = domEvent.screenY as number;
  if ('button' in domEvent) serialized.button = domEvent.button as number;
  if ('buttons' in domEvent) serialized.buttons = domEvent.buttons as number;

  if ('key' in domEvent) serialized.key = domEvent.key as string;
  if ('code' in domEvent) serialized.code = domEvent.code as string;
  if ('repeat' in domEvent) serialized.repeat = domEvent.repeat as boolean;

  if ('deltaX' in domEvent) serialized.deltaX = domEvent.deltaX as number;
  if ('deltaY' in domEvent) serialized.deltaY = domEvent.deltaY as number;
  if ('deltaZ' in domEvent) serialized.deltaZ = domEvent.deltaZ as number;
  if ('deltaMode' in domEvent) serialized.deltaMode = domEvent.deltaMode as number;

  const target = domEvent.target as Record<string, unknown> | undefined;
  if (target && typeof target === 'object') {
    if ('value' in target && typeof target.value === 'string') {
      serialized.value = target.value;
    }
    if ('checked' in target && typeof target.checked === 'boolean') {
      serialized.checked = target.checked;
    }
    if ('scrollTop' in target && typeof target.scrollTop === 'number') {
      serialized.scrollTop = target.scrollTop;
    }
    if ('scrollLeft' in target && typeof target.scrollLeft === 'number') {
      serialized.scrollLeft = target.scrollLeft;
    }
  }

  return serialized;
};

const wrapEventHandler = (handler: (detail: SerializedEventData) => void) => {
  return (event: unknown) => {
    handler(serializeEvent(event));
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
        filtered[normalizedKey] = wrapEventHandler(value as (detail: SerializedEventData) => void);
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

  sourceFile.addImportDeclaration({
    moduleSpecifier: '../../../sdk/front-component-common/SerializedEventData',
    namedImports: [{ name: 'SerializedEventData', isTypeOnly: true }],
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
