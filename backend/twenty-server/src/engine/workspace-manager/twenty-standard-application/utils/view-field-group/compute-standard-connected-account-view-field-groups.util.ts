import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardConnectedAccountViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'connectedAccount'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    connectedAccountRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'connectedAccount',
        context: {
          viewName: 'connectedAccountRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    connectedAccountRecordPageFieldsOther:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'connectedAccount',
        context: {
          viewName: 'connectedAccountRecordPageFields',
          viewFieldGroupName: 'other',
          name: 'Other',
          position: 1,
          isVisible: true,
        },
      }),
  };
};
