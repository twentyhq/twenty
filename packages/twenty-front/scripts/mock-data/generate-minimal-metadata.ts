/* oxlint-disable no-console */
import { graphqlRequest, writeGeneratedFile } from './utils.js';

const MINIMAL_METADATA_QUERY = `
  query FindMinimalMetadata {
    minimalMetadata {
      objectMetadataItems {
        id
        nameSingular
        namePlural
        labelSingular
        labelPlural
        icon
        isCustom
        isActive
        isSystem
        isRemote
      }
      views {
        id
        type
        key
        objectMetadataId
      }
      collectionHashes {
        collectionName
        hash
      }
    }
  }
`;

export const generateMinimalMetadata = async (token: string) => {
  console.log('Fetching minimal metadata from /metadata ...');

  const data = (await graphqlRequest(
    '/metadata',
    MINIMAL_METADATA_QUERY,
    token,
  )) as {
    minimalMetadata: Record<string, unknown>;
  };

  writeGeneratedFile(
    'metadata/minimal/mock-minimal-metadata.ts',
    'mockedMinimalMetadata',
    'MinimalMetadata',
    "import { type MinimalMetadata } from '@/metadata-store/types/MinimalMetadata';",
    data.minimalMetadata,
  );
};
