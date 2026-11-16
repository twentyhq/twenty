import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';

type ReleasedStorageStock = {
  bytes: number;
  quantity: number;
};

export const buildReleasedStockByApplication = (
  deletedRows: Pick<FileEntity, 'applicationId' | 'size' | 'status'>[],
): Map<string, ReleasedStorageStock> =>
  deletedRows.reduce((byApplication, row) => {
    if (row.status === FILE_STATUS.REMOTE) {
      return byApplication;
    }

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
