import type { Project, SourceFile } from 'ts-morph';

import { isDefined } from 'twenty-shared/utils';
import { CUSTOM_ELEMENT_NAMES } from './constants';
import { type ComponentSchema } from './schemas';

const getCustomRendererImports = (
  components: ComponentSchema[],
): Map<string, string[]> => {
  const importsByPath = new Map<string, string[]>();

  for (const component of components) {
    if (
      isDefined(component.customHostRenderer) &&
      isDefined(component.customHostRendererPath)
    ) {
      const existing =
        importsByPath.get(component.customHostRendererPath) ?? [];

      if (!existing.includes(component.customHostRenderer)) {
        existing.push(component.customHostRenderer);
      }

      importsByPath.set(component.customHostRendererPath, existing);
    }
  }

  return importsByPath;
};

const generateRegistryEntries = (components: ComponentSchema[]): string => {
  const entries = components
    .map((component) => {
      if (isDefined(component.customHostRenderer)) {
        return `  ['${component.customElementName}', createRemoteComponentRenderer(${component.customHostRenderer})],`;
      }

      return `  ['${component.customElementName}', createRemoteComponentRenderer(createHtmlHostWrapper('${component.htmlTag}'))],`;
    })
    .join('\n');

  return `type ComponentRegistryValue =
  | ReturnType<typeof createRemoteComponentRenderer>
  | typeof RemoteFragmentRenderer;

export const componentRegistry: Map<string, ComponentRegistryValue> = new Map([
${entries}
  ['${CUSTOM_ELEMENT_NAMES.FRAGMENT}', RemoteFragmentRenderer],
]);`;
};

export const generateHostRegistry = (
  project: Project,
  components: ComponentSchema[],
): SourceFile => {
  const sourceFile = project.createSourceFile(
    'host-component-registry.ts',
    '',
    { overwrite: true },
  );

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@remote-dom/react/host',
    namedImports: ['RemoteFragmentRenderer', 'createRemoteComponentRenderer'],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '../utils/createHtmlHostWrapper',
    namedImports: ['createHtmlHostWrapper'],
  });

  const customRendererImports = getCustomRendererImports(components);

  for (const [modulePath, namedImports] of customRendererImports) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: modulePath,
      namedImports,
    });
  }

  sourceFile.addStatements(generateRegistryEntries(components));

  return sourceFile;
};
