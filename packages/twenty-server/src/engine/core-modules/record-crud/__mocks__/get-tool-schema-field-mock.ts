import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const getToolSchemaFieldMock = (
  overrides: Pick<FlatFieldMetadata, 'name' | 'type'> &
    Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    id: `field-id-${overrides.name}`,
    universalIdentifier: overrides.name,
    objectMetadataId: 'object-metadata-id',
    description: null,
    ...overrides,
  });
