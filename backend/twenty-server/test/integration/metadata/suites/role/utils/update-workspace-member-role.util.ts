import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  type UpdateWorkspaceMemberRoleInput,
  updateWorkspaceMemberRoleQueryFactory,
} from 'test/integration/metadata/suites/role/utils/update-workspace-member-role-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type WorkspaceMemberDTO } from 'src/engine/core-modules/user/dtos/workspace-member.dto';

export const updateWorkspaceMemberRole = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: {
  input: UpdateWorkspaceMemberRoleInput;
  gqlFields?: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  updateWorkspaceMemberRole: WorkspaceMemberDTO;
}> => {
  const graphqlOperation = updateWorkspaceMemberRoleQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Workspace member role update should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Workspace member role update has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
