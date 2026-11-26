import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type SetToolCallApprovalLabelsFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const setToolCallApprovalLabels: SetToolCallApprovalLabelsFunction = (
  labels,
) => {
  const setToolCallApprovalLabelsFunction =
    frontComponentHostCommunicationApi.setToolCallApprovalLabels;

  if (!isDefined(setToolCallApprovalLabelsFunction)) {
    throw new Error('setToolCallApprovalLabelsFunction is not set');
  }

  return setToolCallApprovalLabelsFunction(labels);
};
