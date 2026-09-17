import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { buildRecordStockTableNames } from 'src/engine/core-modules/usage-limit/utils/build-record-stock-table-names.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const buildFlatObjectMetadata = (
  overrides: Partial<FlatObjectMetadata>,
): FlatObjectMetadata =>
  ({
    universalIdentifier: overrides.nameSingular,
    isSystem: false,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    ...overrides,
  }) as FlatObjectMetadata;

const buildMaps = (
  flatObjectMetadatas: FlatObjectMetadata[],
): FlatEntityMaps<FlatObjectMetadata> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatObjectMetadatas.map((flatObjectMetadata) => [
        flatObjectMetadata.universalIdentifier,
        flatObjectMetadata,
      ]),
    ),
  }) as FlatEntityMaps<FlatObjectMetadata>;

describe('buildRecordStockTableNames', () => {
  it('names the table of every tracked object', () => {
    const tableNames = buildRecordStockTableNames(
      buildMaps([
        buildFlatObjectMetadata({ nameSingular: 'person' }),
        buildFlatObjectMetadata({
          nameSingular: 'rocket',
          applicationUniversalIdentifier: 'custom-app',
        }),
        buildFlatObjectMetadata({
          nameSingular: 'message',
          isSystem: true,
          universalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
        }),
        buildFlatObjectMetadata({
          nameSingular: 'timelineActivity',
          isSystem: true,
        }),
      ]),
    );

    expect(tableNames).toEqual(['person', '_rocket', 'message']);
  });

  it('skips holes in the map', () => {
    const maps = buildMaps([]);

    maps.byUniversalIdentifier.missing = undefined;

    expect(buildRecordStockTableNames(maps)).toEqual([]);
  });
});
