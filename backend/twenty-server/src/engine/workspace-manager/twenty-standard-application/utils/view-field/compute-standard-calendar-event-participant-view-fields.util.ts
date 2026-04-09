import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardCalendarEventParticipantViewFields = (
  args: Omit<
    CreateStandardViewFieldArgs<'calendarEventParticipant'>,
    'context'
  >,
): Record<string, FlatViewField> => {
  return {
    allCalendarEventParticipantsHandle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEventParticipant',
      context: {
        viewName: 'allCalendarEventParticipants',
        viewFieldName: 'handle',
        fieldName: 'handle',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allCalendarEventParticipantsCalendarEvent:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'allCalendarEventParticipants',
          viewFieldName: 'calendarEvent',
          fieldName: 'calendarEvent',
          position: 1,
          isVisible: true,
          size: 150,
        },
      }),
    allCalendarEventParticipantsDisplayName:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'allCalendarEventParticipants',
          viewFieldName: 'displayName',
          fieldName: 'displayName',
          position: 2,
          isVisible: true,
          size: 150,
        },
      }),
    allCalendarEventParticipantsIsOrganizer:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'allCalendarEventParticipants',
          viewFieldName: 'isOrganizer',
          fieldName: 'isOrganizer',
          position: 3,
          isVisible: true,
          size: 150,
        },
      }),
    allCalendarEventParticipantsResponseStatus:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'allCalendarEventParticipants',
          viewFieldName: 'responseStatus',
          fieldName: 'responseStatus',
          position: 4,
          isVisible: true,
          size: 150,
        },
      }),
    allCalendarEventParticipantsPerson: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEventParticipant',
      context: {
        viewName: 'allCalendarEventParticipants',
        viewFieldName: 'person',
        fieldName: 'person',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
    allCalendarEventParticipantsWorkspaceMember:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'allCalendarEventParticipants',
          viewFieldName: 'workspaceMember',
          fieldName: 'workspaceMember',
          position: 6,
          isVisible: true,
          size: 150,
        },
      }),
    allCalendarEventParticipantsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'calendarEventParticipant',
      context: {
        viewName: 'allCalendarEventParticipants',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 7,
        isVisible: true,
        size: 150,
      },
    }),

    calendarEventParticipantRecordPageFieldsHandle:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'calendarEventParticipantRecordPageFields',
          viewFieldName: 'handle',
          fieldName: 'handle',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarEventParticipantRecordPageFieldsCalendarEvent:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'calendarEventParticipantRecordPageFields',
          viewFieldName: 'calendarEvent',
          fieldName: 'calendarEvent',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarEventParticipantRecordPageFieldsDisplayName:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'calendarEventParticipantRecordPageFields',
          viewFieldName: 'displayName',
          fieldName: 'displayName',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarEventParticipantRecordPageFieldsIsOrganizer:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'calendarEventParticipantRecordPageFields',
          viewFieldName: 'isOrganizer',
          fieldName: 'isOrganizer',
          position: 3,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarEventParticipantRecordPageFieldsResponseStatus:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'calendarEventParticipantRecordPageFields',
          viewFieldName: 'responseStatus',
          fieldName: 'responseStatus',
          position: 4,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarEventParticipantRecordPageFieldsPerson:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'calendarEventParticipantRecordPageFields',
          viewFieldName: 'person',
          fieldName: 'person',
          position: 5,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarEventParticipantRecordPageFieldsWorkspaceMember:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'calendarEventParticipantRecordPageFields',
          viewFieldName: 'workspaceMember',
          fieldName: 'workspaceMember',
          position: 6,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    calendarEventParticipantRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'calendarEventParticipantRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'other',
        },
      }),
    calendarEventParticipantRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'calendarEventParticipant',
        context: {
          viewName: 'calendarEventParticipantRecordPageFields',
          viewFieldName: 'createdBy',
          fieldName: 'createdBy',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'other',
        },
      }),
  };
};
