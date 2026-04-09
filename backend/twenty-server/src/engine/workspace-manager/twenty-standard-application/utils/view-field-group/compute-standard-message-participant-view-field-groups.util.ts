import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardMessageParticipantViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'messageParticipant'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    messageParticipantRecordPageFieldsGeneral:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'messageParticipant',
        context: {
          viewName: 'messageParticipantRecordPageFields',
          viewFieldGroupName: 'general',
          name: 'General',
          position: 0,
          isVisible: true,
        },
      }),
    messageParticipantRecordPageFieldsOther:
      createStandardViewFieldGroupFlatMetadata({
        ...args,
        objectName: 'messageParticipant',
        context: {
          viewName: 'messageParticipantRecordPageFields',
          viewFieldGroupName: 'other',
          name: 'Other',
          position: 1,
          isVisible: true,
        },
      }),
  };
};
