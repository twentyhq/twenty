import { z } from 'zod';

import { camelToSnakeCase } from 'twenty-shared/utils';

import { getDatabaseCrudToolFlatObjects } from 'src/engine/metadata-modules/ai/ai-agent/utils/get-database-crud-tool-flat-objects.util';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

export const LIST_OBJECT_METADATA_NAMES_TOOL_NAME =
  'list_object_metadata_names';

export const listObjectMetadataNamesInputSchema = z.object({});

export type ListObjectMetadataNamesResult = {
  objectNames: string[];
  message: string;
};

export const createListObjectMetadataNamesTool = (
  flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  workspaceId: string,
) => ({
  description:
    'List all available object metadata names in the workspace. Use this to get a fresh list of objects when the initial instructions may be outdated.',
  inputSchema: listObjectMetadataNamesInputSchema,
  execute: async (): Promise<ListObjectMetadataNamesResult> => {
    const { flatObjectMetadataMaps } =
      await flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatObjectMetadataMaps'],
      });

    const objectNames = getDatabaseCrudToolFlatObjects(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .map((obj) => camelToSnakeCase(obj.namePlural))
      .sort();

    return {
      objectNames,
      message: `Found ${objectNames.length} object(s): ${objectNames.join(', ')}.`,
    };
  },
});
