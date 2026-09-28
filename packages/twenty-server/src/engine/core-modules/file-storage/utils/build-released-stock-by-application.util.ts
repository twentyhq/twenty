import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type StockCost } from 'src/engine/core-modules/usage-limit/types/stock-cost.type';

export const buildReleasedStockByApplication = (
  deletedRows: Pick<FileEntity, 'applicationId' | 'size'>[],
): Map<string, Required<Pick<StockCost, 'bytes' | 'quantity'>>> =>
  deletedRows.reduce((byApplication, row) => {
    const released = byApplication.get(row.applicationId) ?? {
      bytes: 0,
      quantity: 0,
    };

    byApplication.set(row.applicationId, {
      bytes: released.bytes + row.size,
      quantity: released.quantity + 1,
    });

    return byApplication;
  }, new Map<string, Required<Pick<StockCost, 'bytes' | 'quantity'>>>());
