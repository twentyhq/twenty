import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type SetToolCallApprovalCardFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const setToolCallApprovalCard: SetToolCallApprovalCardFunction = (
  card,
) => {
  const setToolCallApprovalCardFunction =
    frontComponentHostCommunicationApi.setToolCallApprovalCard;

  if (!isDefined(setToolCallApprovalCardFunction)) {
    throw new Error('setToolCallApprovalCardFunction is not set');
  }

  return setToolCallApprovalCardFunction(card);
};
