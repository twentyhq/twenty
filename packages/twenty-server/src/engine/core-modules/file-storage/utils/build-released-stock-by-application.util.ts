import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

type ReleasedStorageStock = {
  bytes: number;
  quantity: number;
};

export const buildReleasedStockByApplication = (
  deletedRows: Pick<FileEntity, 'applicationId' | 'size'>[],
): Map<string, ReleasedStorageStock> =>
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
  }, new Map<string, ReleasedStorageStock>());
