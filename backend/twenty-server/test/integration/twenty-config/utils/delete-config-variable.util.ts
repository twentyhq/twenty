import { type PerformTwentyConfigQueryParams } from 'test/integration/twenty-config/types/perform-twenty-config-query.type';

import {
  type DeleteConfigVariableFactoryInput,
  deleteConfigVariableQueryFactory,
} from './delete-config-variable.query-factory.util';
import { makeAdminPanelAPIRequest } from './make-admin-panel-api-request.util';

export const deleteConfigVariable = async ({
  input,
  expectToFail = false,
}: PerformTwentyConfigQueryParams<DeleteConfigVariableFactoryInput>) => {
  const graphqlOperation = deleteConfigVariableQueryFactory({
    key: input.key,
  });

  const response = await makeAdminPanelAPIRequest(graphqlOperation);

  if (!expectToFail) {
    expect(response.body.data).toBeDefined();
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteDatabaseConfigVariable).toBeDefined();
  } else {
    expect(response.body.errors).toBeDefined();
  }

  return { data: response.body.data, errors: response.body.errors };
};
