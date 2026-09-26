import { camelToSnakeCase } from 'twenty-shared/utils';

import { type McpObjectNameForms } from 'src/engine/api/mcp/types/mcp-object-name-forms.type';
import { getDatabaseCrudToolFlatObjects } from 'src/engine/metadata-modules/ai/ai-agent/utils/get-database-crud-tool-flat-objects.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getMcpObjectNameForms = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
): McpObjectNameForms[] =>
  getDatabaseCrudToolFlatObjects(flatObjectMetadataMaps.byUniversalIdentifier)
    .map((flatObject) => ({
      nameSingular: camelToSnakeCase(flatObject.nameSingular),
      namePlural: camelToSnakeCase(flatObject.namePlural),
    }))
    .sort((left, right) => left.nameSingular.localeCompare(right.nameSingular));
