import { Injectable } from '@nestjs/common';

import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class QueryRunnerArgsFactory {
  constructor(
    private readonly recordInputTransformerService: RecordInputTransformerService,
  ) {}

  async overrideValueByFieldMetadata(
    key: string,
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    value: any,
    fieldIdByName: Record<string, string>,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldIdByName[key],
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!fieldMetadata) {
      return value;
    }

    const processed = await this.recordInputTransformerService.process({
      recordInput: { [key]: value },
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });

    return processed[key] ?? value;
  }
}
