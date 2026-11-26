import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findPersonIdsByWhatsappPhone } from 'src/logic-functions/utils/find-person-ids-by-whatsapp-phone.util';
import { getWhatsappPersonId } from 'src/logic-functions/utils/get-whatsapp-person-id.util';

const insertWhatsappPerson = async ({
  id,
  firstName,
  lastName,
  handle,
}: {
  id?: string;
  firstName: string;
  lastName: string;
  handle: string;
}): Promise<string> => {
  const { createPerson } = await new CoreApiClient({
    runAs: 'application',
  }).mutation({
    createPerson: {
      __args: {
        data: {
          ...(isDefined(id) ? { id } : {}),
          name: { firstName, lastName },
          phones: { primaryPhoneNumber: handle },
        },
      },
      id: true,
    },
  });

  if (!isDefined(createPerson)) {
    throw new Error(`Could not create the person for ${handle}`);
  }

  return createPerson.id;
};

const isPersonIdTakenError = (error: unknown): boolean =>
  error instanceof Error && error.message.includes('person_pkey');

export const createWhatsappPerson = async ({
  firstName,
  lastName,
  handle,
}: {
  firstName: string;
  lastName: string;
  handle: string;
}): Promise<string> => {
  const id = await getWhatsappPersonId(handle);

  try {
    const createdPersonId = await insertWhatsappPerson({
      id,
      firstName,
      lastName,
      handle,
    });

    console.log(`[whatsapp] created person ${createdPersonId} for ${handle}`);

    return createdPersonId;
  } catch (error) {
    const [existingPersonId] = await findPersonIdsByWhatsappPhone(handle);

    if (isDefined(existingPersonId)) {
      console.log(
        `[whatsapp] reused person ${existingPersonId} for ${handle} after create failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return existingPersonId;
    }

    if (!isPersonIdTakenError(error)) {
      throw error;
    }

    const createdPersonId = await insertWhatsappPerson({
      firstName,
      lastName,
      handle,
    });

    console.log(
      `[whatsapp] created person ${createdPersonId} for ${handle} with a new id, ${id} is taken: ${error instanceof Error ? error.message : String(error)}`,
    );

    return createdPersonId;
  }
};
