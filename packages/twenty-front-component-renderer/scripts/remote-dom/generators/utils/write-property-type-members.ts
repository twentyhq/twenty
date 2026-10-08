import { type CodeBlockWriter } from 'ts-morph';

import { type PropertySchema } from '../schemas';

export const writePropertyTypeMembers = ({
  writer,
  properties,
}: {
  writer: CodeBlockWriter;
  properties: Record<string, PropertySchema>;
}): void => {
  for (const [propertyName, propertySchema] of Object.entries(properties)) {
    const optionalMarker = propertySchema.optional ? '?' : '';

    writer.writeLine(
      `'${propertyName}'${optionalMarker}: ${propertySchema.type};`,
    );
  }
};
