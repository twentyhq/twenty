import { RecordExportStatus } from '~/generated-metadata/graphql';
import { type RecordExportSummary } from '@/record-export/types/RecordExportSummary';

export const mergeRecordExports = (
  current: RecordExportSummary[],
  incoming: RecordExportSummary[],
): RecordExportSummary[] => {
  const exportsById = new Map(
    current.map((recordExport) => [recordExport.id, recordExport]),
  );

  for (const recordExport of incoming) {
    const existing = exportsById.get(recordExport.id);
    if (
      existing &&
      [RecordExportStatus.COMPLETED, RecordExportStatus.FAILED].includes(
        existing.status,
      )
    )
      continue;
    if (
      !existing ||
      new Date(recordExport.updatedAt).getTime() >=
        new Date(existing.updatedAt).getTime()
    ) {
      exportsById.set(recordExport.id, recordExport);
    }
  }

  return [...exportsById.values()]
    .filter(
      (recordExport) => new Date(recordExport.expiresAt).getTime() > Date.now(),
    )
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
    .slice(0, 10);
};
