import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export const getApproximateRecordCount = (
  flatObjectMetadata: FlatObjectMetadata,
  approximateRecordCountByTableName: Map<string, number>,
): number =>
  approximateRecordCountByTableName.get(
    computeObjectTargetTable(flatObjectMetadata),
  ) ?? 0;
