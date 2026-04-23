import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardConnectedAccountViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'connectedAccount'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allConnectedAccountsHandle: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'connectedAccount',
      context: {
        viewName: 'allConnectedAccounts',
        viewFieldName: 'handle',
        fieldName: 'handle',
        position: 0,
        isVisible: true,
        size: 150,
      },
    }),
    allConnectedAccountsProvider: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'connectedAccount',
      context: {
        viewName: 'allConnectedAccounts',
        viewFieldName: 'provider',
        fieldName: 'provider',
        position: 1,
        isVisible: true,
        size: 150,
      },
    }),
    allConnectedAccountsAccountOwner: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'connectedAccount',
      context: {
        viewName: 'allConnectedAccounts',
        viewFieldName: 'accountOwner',
        fieldName: 'accountOwner',
        position: 2,
        isVisible: true,
        size: 150,
      },
    }),
    allConnectedAccountsAuthFailedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'connectedAccount',
      context: {
        viewName: 'allConnectedAccounts',
        viewFieldName: 'authFailedAt',
        fieldName: 'authFailedAt',
        position: 3,
        isVisible: true,
        size: 150,
      },
    }),
    allConnectedAccountsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'connectedAccount',
      context: {
        viewName: 'allConnectedAccounts',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),

    connectedAccountRecordPageFieldsProvider:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'connectedAccount',
        context: {
          viewName: 'connectedAccountRecordPageFields',
          viewFieldName: 'provider',
          fieldName: 'provider',
          position: 1,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    connectedAccountRecordPageFieldsAccountOwner:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'connectedAccount',
        context: {
          viewName: 'connectedAccountRecordPageFields',
          viewFieldName: 'accountOwner',
          fieldName: 'accountOwner',
          position: 2,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    connectedAccountRecordPageFieldsAuthFailedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'connectedAccount',
        context: {
          viewName: 'connectedAccountRecordPageFields',
          viewFieldName: 'authFailedAt',
          fieldName: 'authFailedAt',
          position: 3,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'general',
        },
      }),
    connectedAccountRecordPageFieldsCreatedAt:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'connectedAccount',
        context: {
          viewName: 'connectedAccountRecordPageFields',
          viewFieldName: 'createdAt',
          fieldName: 'createdAt',
          position: 0,
          isVisible: true,
          size: 150,
          viewFieldGroupName: 'other',
        },
      }),
    connectedAccountRecordPageFieldsCreatedBy:
      createStandardViewFieldFlatMetadata({
        ...args,
        objectName: 'connectedAccount',
        context: {
          viewName: 'connectedAccountRecordPageFields',
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
