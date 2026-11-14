import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { CommonResultGettersService } from 'src/engine/api/common/common-result-getters/common-result-getters.service';
import { type FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const buildFlatEntityMaps = <
  TFlatEntity extends FlatFieldMetadata | FlatObjectMetadata,
>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> =>
  flatEntities.reduce(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<TFlatEntity>,
  );

const attachmentsField = getFlatFieldMetadataMock({
  universalIdentifier: 'company-attachments',
  objectMetadataId: 'company',
  type: FieldMetadataType.RELATION,
  name: 'attachments',
  settings: { relationType: RelationType.ONE_TO_MANY },
  relationTargetObjectMetadataId: 'attachment',
});

const fileField = getFlatFieldMetadataMock({
  universalIdentifier: 'attachment-file',
  objectMetadataId: 'attachment',
  type: FieldMetadataType.FILES,
  name: 'file',
});

const company = getFlatObjectMetadataMock({
  id: 'company',
  universalIdentifier: 'company',
  nameSingular: 'company',
  fieldIds: [attachmentsField.id],
});

const attachment = getFlatObjectMetadataMock({
  id: 'attachment',
  universalIdentifier: 'attachment',
  nameSingular: 'attachment',
  fieldIds: [fileField.id],
});

describe('CommonResultGettersService', () => {
  it('signs files of records loaded under an aliased relation', async () => {
    const service = new CommonResultGettersService({
      signFileByIdUrl: jest.fn().mockResolvedValue('signed-url'),
    } as unknown as FileUrlService);

    const processedRecord = await service.processRecord(
      {
        id: 'company-1',
        'attachments::files': [
          {
            id: 'attachment-1',
            file: [{ fileId: 'file-1', label: 'a.png', extension: 'png' }],
          },
        ],
      },
      company,
      buildFlatEntityMaps([company, attachment]),
      buildFlatEntityMaps([attachmentsField, fileField]),
      'workspace-id',
    );

    expect(processedRecord['attachments::files']).toEqual([
      {
        id: 'attachment-1',
        file: [
          {
            fileId: 'file-1',
            label: 'a.png',
            extension: 'png',
            url: 'signed-url',
          },
        ],
      },
    ]);
  });
});
