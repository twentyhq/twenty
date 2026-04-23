import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardMessageChannelViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'messageChannel'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allMessageChannelsHandle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageChannel',
      context: {
        viewName: 'allMessageChannels',
        viewFieldName: 'handle',
        fieldName: 'handle',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageChannelsConnectedAccount: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageChannel',
      context: {
        viewName: 'allMessageChannels',
        viewFieldName: 'connectedAccount',
        fieldName: 'connectedAccount',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageChannelsType: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageChannel',
      context: {
        viewName: 'allMessageChannels',
        viewFieldName: 'type',
        fieldName: 'type',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageChannelsVisibility: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageChannel',
      context: {
        viewName: 'allMessageChannels',
        viewFieldName: 'visibility',
        fieldName: 'visibility',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageChannelsIsSyncEnabled: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageChannel',
      context: {
        viewName: 'allMessageChannels',
        viewFieldName: 'isSyncEnabled',
        fieldName: 'isSyncEnabled',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageChannelsSyncStatus: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageChannel',
      context: {
        viewName: 'allMessageChannels',
        viewFieldName: 'syncStatus',
        fieldName: 'syncStatus',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
    allMessageChannelsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageChannel',
      context: {
        viewName: 'allMessageChannels',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),

    messageChannelRecordPageFieldsConnectedAccount:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannel',
        context: {
          viewName: 'messageChannelRecordPageFields',
          viewFieldName: 'connectedAccount',
          fieldName: 'connectedAccount',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelRecordPageFieldsType: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'messageChannel',
      context: {
        viewName: 'messageChannelRecordPageFields',
        viewFieldName: 'type',
        fieldName: 'type',
        position: 2,
        isVisible: true,
        size: 150,
        viewFieldGroupName: 'general',
      },
    }),
    messageChannelRecordPageFieldsVisibility:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannel',
        context: {
          viewName: 'messageChannelRecordPageFields',
          viewFieldName: 'visibility',
          fieldName: 'visibility',
          position: 3,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelRecordPageFieldsIsSyncEnabled:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannel',
        context: {
          viewName: 'messageChannelRecordPageFields',
          viewFieldName: 'isSyncEnabled',
          fieldName: 'isSyncEnabled',
          position: 4,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelRecordPageFieldsSyncStatus:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannel',
        context: {
          viewName: 'messageChannelRecordPageFields',
          viewFieldName: 'syncStatus',
          fieldName: 'syncStatus',
          position: 5,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    messageChannelRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannel',
        context: {
          viewName: 'messageChannelRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'other',
        },
      }),
    messageChannelRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'messageChannel',
        context: {
          viewName: 'messageChannelRecordPageFields',
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
