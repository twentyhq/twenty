import { MetadataReadability } from 'twenty-shared/types';

import { createListObjectMetadataNamesTool } from 'src/engine/api/mcp/tools/list-object-metadata-names.tool';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const buildTool = (objects: FlatObjectMetadata[]) => {
  const flatObjectMetadataMaps =
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>;

  for (const object of objects) {
    flatObjectMetadataMaps.byUniversalIdentifier[object.universalIdentifier] =
      object;
  }

  const flatEntityMapsCacheService = {
    getOrRecomputeManyOrAllFlatEntityMaps: jest
      .fn()
      .mockResolvedValue({ flatObjectMetadataMaps }),
  } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService;

  return createListObjectMetadataNamesTool(
    flatEntityMapsCacheService,
    'workspace-id',
  );
};

const buildObject = (
  nameSingular: string,
  namePlural: string,
  readability = MetadataReadability.OPEN,
) =>
  getFlatObjectMetadataMock({
    universalIdentifier: nameSingular,
    nameSingular,
    namePlural,
    readability,
  });

describe('createListObjectMetadataNamesTool', () => {
  it('keeps the plural names and message while pairing every object', async () => {
    const tool = buildTool([
      buildObject('person', 'people'),
      buildObject('noteTarget', 'noteTargets'),
      buildObject('company', 'companies'),
      buildObject('sheep', 'sheep'),
      buildObject('blocklist', 'blocklists', MetadataReadability.SYSTEM),
    ]);

    expect(await tool.execute()).toEqual({
      objectNames: ['companies', 'note_targets', 'people', 'sheep'],
      objectNamePairs: [
        'company/companies',
        'note_target/note_targets',
        'person/people',
        'sheep/sheep',
      ],
      message: 'Found 4 object(s): companies, note_targets, people, sheep.',
    });
  });
});
