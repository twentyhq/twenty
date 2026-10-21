import { type SourceFile } from 'ts-morph';

import { INTERNAL_ELEMENT_CLASSES } from '../constants';

export const generateRemoteElementsImports = (sourceFile: SourceFile): void => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: '@remote-dom/core/elements',
    namedImports: [
      'createRemoteElement',
      INTERNAL_ELEMENT_CLASSES.ROOT,
      INTERNAL_ELEMENT_CLASSES.FRAGMENT,
      { name: 'RemoteElementEventListenerDefinition', isTypeOnly: true },
      { name: 'RemoteElementEventListenersDefinition', isTypeOnly: true },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier:
      '@/remote/elements/utils/createWorkerEventFromSerializedEvent',
    namedImports: ['createWorkerEventFromSerializedEvent'],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@/types/SerializedEventData',
    namedImports: [{ name: 'SerializedEventData', isTypeOnly: true }],
  });
};
