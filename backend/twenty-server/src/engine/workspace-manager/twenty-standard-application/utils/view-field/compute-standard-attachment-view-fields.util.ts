import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardAttachmentViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'attachment'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allAttachmentsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'attachment',
      context: {
        viewName: 'allAttachments',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    allAttachmentsFile: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'attachment',
      context: {
        viewName: 'allAttachments',
        viewFieldName: 'file',
        fieldName: 'file',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    // All morph targets are included so the surviving field after dedup always has a viewField
    allAttachmentsTargetPerson: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'attachment',
      context: {
        viewName: 'allAttachments',
        viewFieldName: 'targetPerson',
        fieldName: 'targetPerson',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allAttachmentsTargetCompany: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'attachment',
      context: {
        viewName: 'allAttachments',
        viewFieldName: 'targetCompany',
        fieldName: 'targetCompany',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allAttachmentsTargetOpportunity: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'attachment',
      context: {
        viewName: 'allAttachments',
        viewFieldName: 'targetOpportunity',
        fieldName: 'targetOpportunity',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
    allAttachmentsTargetTask: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'attachment',
      context: {
        viewName: 'allAttachments',
        viewFieldName: 'targetTask',
        fieldName: 'targetTask',
        position: 5,
        isVisible: true,
        size: 150,
      },
    }),
    allAttachmentsTargetNote: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'attachment',
      context: {
        viewName: 'allAttachments',
        viewFieldName: 'targetNote',
        fieldName: 'targetNote',
        position: 6,
        isVisible: true,
        size: 150,
      },
    }),
    allAttachmentsTargetDashboard: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'attachment',
      context: {
        viewName: 'allAttachments',
        viewFieldName: 'targetDashboard',
        fieldName: 'targetDashboard',
        position: 7,
        isVisible: true,
        size: 150,
      },
    }),
    allAttachmentsTargetWorkflow: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'attachment',
      context: {
        viewName: 'allAttachments',
        viewFieldName: 'targetWorkflow',
        fieldName: 'targetWorkflow',
        position: 8,
        isVisible: true,
        size: 150,
      },
    }),
    allAttachmentsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'attachment',
      context: {
        viewName: 'allAttachments',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 9,
        isVisible: true,
        size: 150,
      },
    }),
    allAttachmentsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'attachment',
      context: {
        viewName: 'allAttachments',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 10,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
