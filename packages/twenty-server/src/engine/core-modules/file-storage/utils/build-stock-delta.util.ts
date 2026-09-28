import { isDefined } from 'twenty-shared/utils';

import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type StockCost } from 'src/engine/core-modules/usage-limit/types/stock-cost.type';

export const buildStockDelta = ({
  existingFile,
  size,
}: {
  existingFile: Pick<FileEntity, 'size'> | null;
  size: number;
}): StockCost => ({
  bytes: size - (existingFile?.size ?? 0),
  quantity: isDefined(existingFile) ? 0 : 1,
});
