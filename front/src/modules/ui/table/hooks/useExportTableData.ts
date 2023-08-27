import { useRecoilCallback } from 'recoil';

import { tableEntitiesFamilyState } from '@/ui/table/states/tableEntitiesFamilyState';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
import { downloadBlob } from '~/utils/downloadBlob';
import { objectArrayToCsv } from '~/utils/objectArrayToCsv';

export function useExportTableData() {
  return useRecoilCallback(
    ({ snapshot }) =>
      (fileName: string) => {
        const entityIds = snapshot.getLoadable(tableRowIdsState).valueOrThrow();
        const entities = [];
        for (const id of entityIds) {
          entities.push(
            snapshot.getLoadable(tableEntitiesFamilyState(id)).valueOrThrow(),
          );
        }
        const csv = objectArrayToCsv(entities, (key, value) => {
          if (typeof value == 'object') {
            return value?.name;
          }
          return value;
        });
        downloadBlob(csv, fileName, 'text/csv;charset=utf-8;');
      },
    [],
  );
}
