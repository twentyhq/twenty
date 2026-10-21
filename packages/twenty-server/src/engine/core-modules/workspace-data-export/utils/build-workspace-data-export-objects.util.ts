import { type WorkspaceDataExportObjectDTO } from 'src/engine/core-modules/workspace-data-export/dtos/workspace-data-export-object.dto';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';

export const buildWorkspaceDataExportObjects = (
  state: Pick<
    WorkspaceDataExportState,
    'objects' | 'partsByObject' | 'completedObjectCount'
  >,
): WorkspaceDataExportObjectDTO[] =>
  state.objects.map((object, objectIndex) => ({
    nameSingular: object.nameSingular,
    labelSingular: object.labelSingular,
    fieldCount: object.fieldCount,
    recordCount: state.partsByObject[object.nameSingular].reduce(
      (total, part) => total + part.recordCount,
      0,
    ),
    isExported: objectIndex < state.completedObjectCount,
  }));
