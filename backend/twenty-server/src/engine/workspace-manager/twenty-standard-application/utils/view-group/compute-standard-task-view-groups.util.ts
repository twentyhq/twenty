import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import {
  createStandardViewGroupFlatMetadata,
  type CreateStandardViewGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-group/create-standard-view-group-flat-metadata.util';

export const computeStandardTaskViewGroups = (
  args: Omit<CreateStandardViewGroupArgs<'task'>, 'context'>,
): Record<string, FlatViewGroup> => {
  return {
    assignedToMeTodo: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewGroupName: 'todo',
        isVisible: true,
        fieldValue: 'TODO',
        position: 0,
      },
    }),
    assignedToMeInProgress: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewGroupName: 'inProgress',
        isVisible: true,
        fieldValue: 'IN_PROGRESS',
        position: 1,
      },
    }),
    assignedToMeDone: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewGroupName: 'done',
        isVisible: true,
        fieldValue: 'DONE',
        position: 2,
      },
    }),
    assignedToMeEmpty: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'assignedToMe',
        viewGroupName: 'empty',
        isVisible: true,
        fieldValue: '',
        position: 3,
      },
    }),
    byStatusTodo: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'byStatus',
        viewGroupName: 'todo',
        isVisible: true,
        fieldValue: 'TODO',
        position: 0,
      },
    }),
    byStatusInProgress: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'byStatus',
        viewGroupName: 'inProgress',
        isVisible: true,
        fieldValue: 'IN_PROGRESS',
        position: 1,
      },
    }),
    byStatusDone: createStandardViewGroupFlatMetadata({
      ...args,
      objectName: 'task',
      context: {
        viewName: 'byStatus',
        viewGroupName: 'done',
        isVisible: true,
        fieldValue: 'DONE',
        position: 2,
      },
    }),
  };
};
