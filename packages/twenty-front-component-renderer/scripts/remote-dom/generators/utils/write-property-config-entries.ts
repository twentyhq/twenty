import { type CodeBlockWriter } from 'ts-morph';

import { type PropertySchema } from '../schemas';
import { schemaTypeToConstructor } from './schema-type-to-constructor';

export const writePropertyConfigEntries = ({
  writer,
  properties,
}: {
  writer: CodeBlockWriter;
  properties: Record<string, PropertySchema>;
}): void => {
  for (const [propertyName, propertySchema] of Object.entries(properties)) {
    writer.writeLine(
      `'${propertyName}': { type: ${schemaTypeToConstructor(propertySchema.type)} },`,
    );
  }
};
