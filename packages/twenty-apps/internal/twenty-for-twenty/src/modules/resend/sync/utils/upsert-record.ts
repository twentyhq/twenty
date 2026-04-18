import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import { capitalize } from 'src/modules/resend/shared/utils/capitalize';

export const upsertRecord = async (
  client: CoreApiClient,
  objectNameSingular: string,
  existingMap: Map<string, string>,
  resendId: string,
  data: Record<string, unknown>,
): Promise<'created' | 'updated'> => {
  const existingTwentyId = existingMap.get(resendId);

  const createMutationName = `create${capitalize(objectNameSingular)}`;
  const updateMutationName = `update${capitalize(objectNameSingular)}`;

  if (isDefined(existingTwentyId)) {
    await client.mutation({
      [updateMutationName]: {
        __args: {
          id: existingTwentyId,
          data,
        },
        id: true,
      },
    });

    return 'updated';
  }

  const createResult = await client.mutation({
    [createMutationName]: {
      __args: {
        data: { ...data, resendId },
      },
      id: true,
    },
  });

  const created = (createResult as Record<string, unknown>)[
    createMutationName
  ] as { id: string } | undefined;

  if (isDefined(created)) {
    existingMap.set(resendId, created.id);
  }

  return 'created';
};
