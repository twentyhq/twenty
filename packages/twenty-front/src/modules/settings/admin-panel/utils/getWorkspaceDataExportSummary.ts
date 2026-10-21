import { type WorkspaceDataExportObject } from '~/generated-admin/graphql';

export const getWorkspaceDataExportSummary = (
  objects: Pick<
    WorkspaceDataExportObject,
    'columnCount' | 'rowCount' | 'isExported'
  >[],
) =>
  objects.reduce(
    (summary, object) => ({
      objectCount: summary.objectCount + 1,
      exportedObjectCount:
        summary.exportedObjectCount + (object.isExported ? 1 : 0),
      columnCount: summary.columnCount + object.columnCount,
      rowCount: summary.rowCount + object.rowCount,
    }),
    { objectCount: 0, exportedObjectCount: 0, columnCount: 0, rowCount: 0 },
  );
