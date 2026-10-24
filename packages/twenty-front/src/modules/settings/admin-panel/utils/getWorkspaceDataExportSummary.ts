import { type WorkspaceDataExportObject } from '~/generated-admin/graphql';

export const getWorkspaceDataExportSummary = (
  objects: Pick<
    WorkspaceDataExportObject,
    'fieldCount' | 'recordCount' | 'isExported'
  >[],
) =>
  objects.reduce(
    (summary, object) => ({
      objectCount: summary.objectCount + 1,
      exportedObjectCount:
        summary.exportedObjectCount + (object.isExported ? 1 : 0),
      fieldCount: summary.fieldCount + object.fieldCount,
      recordCount: summary.recordCount + object.recordCount,
    }),
    { objectCount: 0, exportedObjectCount: 0, fieldCount: 0, recordCount: 0 },
  );
