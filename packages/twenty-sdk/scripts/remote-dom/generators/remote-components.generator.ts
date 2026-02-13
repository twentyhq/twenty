import type { Project, SourceFile } from 'ts-morph';

import { EVENT_TO_REACT } from '@/sdk/front-component-api/constants/EventToReact';
import { type ComponentSchema } from './schemas';
import { addExportedConst, addFileHeader } from './utils';

const generateComponentDefinition = (
  sourceFile: SourceFile,
  component: ComponentSchema,
): void => {
  const hasEvents = component.events.length > 0;
  const componentExportName = component.tagName;

  let initializer: string;

  if (hasEvents) {
    const eventProps = component.events
      .map((event) => {
        const propName = EVENT_TO_REACT[event];
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

  addExportedConst(sourceFile, componentExportName, initializer);
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

  const elementImports = components.map(
    (component) => `${component.name}Element`,
  );

  sourceFile.addImportDeclaration({
    moduleSpecifier: './remote-elements',
    namedImports: elementImports,
  });

  for (const component of components) {
    generateComponentDefinition(sourceFile, component);
  }

  addFileHeader(sourceFile);

  return sourceFile;
};
