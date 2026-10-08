import { isDefined } from 'twenty-shared/utils';

import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type StockCost } from 'src/engine/core-modules/usage-limit/types/stock-cost.type';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

export const buildStockDelta = ({
  existingFile,
  size,
}: {
  existingFile: Pick<FileEntity, 'size'> | null;
  size: number;
}): StockCost => ({
  [UsageUnit.BYTE]: size - (existingFile?.size ?? 0),
  [UsageUnit.FILE]: isDefined(existingFile) ? 0 : 1,
});
