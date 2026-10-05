import { type SourceFile, VariableDeclarationKind } from 'ts-morph';

import { TYPE_NAMES } from '../constants';
import { type RemoteElementDescriptor } from '../types/remote-element-descriptor.type';
import { resolveElementEventsType } from './resolve-element-events-type';
import { resolveElementPropertiesType } from './resolve-element-properties-type';
import { writeElementEventsConfig } from './write-element-events-config';
import { writeElementPropertiesConfig } from './write-element-properties-config';

export const generateElementDefinition = ({
  sourceFile,
  elementDescriptor,
  hasCommonPropertiesConfig,
}: {
  sourceFile: SourceFile;
  elementDescriptor: RemoteElementDescriptor;
  hasCommonPropertiesConfig: boolean;
}): void => {
  const propertiesType = resolveElementPropertiesType(elementDescriptor);
  const methodsType = TYPE_NAMES.EMPTY_RECORD;
  const slotsType = TYPE_NAMES.EMPTY_RECORD;
  const eventsType = resolveElementEventsType(elementDescriptor);
  const hasConfig =
    elementDescriptor.hasProperties || elementDescriptor.hasEvents;

  sourceFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: elementDescriptor.elementName,
        initializer: (writer) => {
          writer.write('createRemoteElement<');
          writer.newLine();
          writer.indent(() => {
            writer.writeLine(`${propertiesType},`);
            writer.writeLine(`${methodsType},`);
            writer.writeLine(`${slotsType},`);
            writer.write(eventsType);
          });
          writer.newLine();
          writer.write('>');

          if (!hasConfig) {
            writer.write('({})');
            return;
          }

          writer.write('(');
          writer.block(() => {
            if (elementDescriptor.hasProperties) {
              writeElementPropertiesConfig({
                writer,
                elementDescriptor,
                hasCommonPropertiesConfig,
              });
            }

            if (elementDescriptor.hasEvents) {
              writeElementEventsConfig({ writer, elementDescriptor });
            }
          });
          writer.write(')');
        },
      },
    ],
  });
};
