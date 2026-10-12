import { type SourceFile } from 'ts-morph';

import { TYPE_NAMES } from '../constants';
import { type RemoteElementDescriptor } from '../types/remote-element-descriptor.type';
import { writePropertyTypeMembers } from './write-property-type-members';

export const generateElementPropertiesType = ({
  sourceFile,
  elementDescriptor,
}: {
  sourceFile: SourceFile;
  elementDescriptor: RemoteElementDescriptor;
}): void => {
  if (!elementDescriptor.hasSpecificProperties) {
    return;
  }

  sourceFile.addTypeAlias({
    isExported: true,
    name: elementDescriptor.propertiesTypeName,
    type: (writer) => {
      if (elementDescriptor.isHtmlElement) {
        writer.write(`${TYPE_NAMES.COMMON_PROPERTIES} & `);
      }

      writer.block(() => {
        writePropertyTypeMembers({
          writer,
          properties: elementDescriptor.specificProperties,
        });
      });
    },
  });
};
