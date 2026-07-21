import type { Project, SourceFile } from 'ts-morph';
import { isDefined } from 'twenty-shared/utils';

import { DOM_EVENT_TYPE_TO_REACT_PROP } from '../../../src/constants/DomEventTypeToReactProp';
import { type ComponentSchema } from './schemas';
import { addExportedConst } from './utils';

const generateComponentDefinition = (
  sourceFile: SourceFile,
  component: ComponentSchema,
): void => {
  const hasEvents = component.events.length > 0;

  let initializer: string;

  if (hasEvents) {
    const eventProps = component.events
      .map((event) => {
        const propName = DOM_EVENT_TYPE_TO_REACT_PROP[event];
        if (!isDefined(propName)) {
          throw new Error(
            `Missing DOM_EVENT_TYPE_TO_REACT_PROP mapping for '${event}'`,
          );
        }
        return `    ${propName}: { event: '${event}' },`;
      })
      .join('\n');

    initializer = `createRemoteComponent('${component.customElementName}', ${component.name}Element, {
  eventProps: {
${eventProps}
  },
})`;
  } else {
    initializer = `createRemoteComponent('${component.customElementName}', ${component.name}Element)`;
  }

  addExportedConst(sourceFile, component.name, initializer);
};

export const generateRemoteComponents = (
  project: Project,
  components: ComponentSchema[],
): SourceFile => {
  const sourceFile = project.createSourceFile('remote-components.ts', '', {
    overwrite: true,
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@remote-dom/react',
    namedImports: ['createRemoteComponent'],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: './remote-elements',
    namedImports: components.map((component) => `${component.name}Element`),
  });

  for (const component of components) {
    generateComponentDefinition(sourceFile, component);
  }

  return sourceFile;
};
