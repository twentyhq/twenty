import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardWorkflowRunViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'workflowRun'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    workflowRunRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'workflowRun',
        context: {
          viewName: 'workflowRunRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    workflowRunRecordPageFieldsAdditional:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'workflowRun',
        context: {
          viewName: 'workflowRunRecordPageFields',
          viewFieldGroupName: 'additional',
          name: 'Additional',
          position: 1,
          isVisible: true,
        },
      }),
    workflowRunRecordPageFieldsOther: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'workflowRun',
      context: {
        viewName: 'workflowRunRecordPageFields',
        viewFieldGroupName: 'other',
        name: 'Other',
        position: 2,
        isVisible: true,
      },
    }),
  };
};
