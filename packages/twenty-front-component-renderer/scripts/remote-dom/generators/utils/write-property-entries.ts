import { type CodeBlockWriter } from 'ts-morph';
import { type PropertySchema } from '../schemas';
import { schemaTypeToConstructor } from '../utils';

export const writePropertyEntries = ({
  writer,
  properties,
}: {
  writer: CodeBlockWriter;
  properties: Record<string, PropertySchema>;
}): void => {
  for (const [name, schema] of Object.entries(properties)) {
    writer.writeLine(
      `'${name}': { type: ${schemaTypeToConstructor(schema.type)} },`,
    );
  }
};
