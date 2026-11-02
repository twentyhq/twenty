import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findPersonIdsByLinkedinHandle } from 'src/logic-functions/utils/find-person-ids-by-linkedin-handle.util';
import { getLinkedinPersonId } from 'src/logic-functions/utils/get-linkedin-person-id.util';
import { getLinkedinProfileSlug } from 'src/logic-functions/utils/get-linkedin-profile-slug.util';

const insertLinkedinPerson = async ({
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
          linkedinLink: { primaryLinkUrl: handle },
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

export const createLinkedinPerson = async ({
  firstName,
  lastName,
  handle,
}: {
  firstName: string;
  lastName: string;
  handle: string;
}): Promise<string> => {
  const slug = getLinkedinProfileSlug(handle);

  if (slug === null) {
    throw new Error(`Could not create the person for ${handle}`);
  }

  const id = await getLinkedinPersonId(slug);

  try {
    const createdPersonId = await insertLinkedinPerson({
      id,
      firstName,
      lastName,
      handle,
    });

    console.log(
      `[linkedin] created person ${createdPersonId} for ${handle} (slug ${slug})`,
    );

    return createdPersonId;
  } catch (error) {
    const [existingPersonId] = await findPersonIdsByLinkedinHandle(handle);

    if (isDefined(existingPersonId)) {
      console.log(
        `[linkedin] reused person ${existingPersonId} for ${handle} after create failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return existingPersonId;
    }

    const createdPersonId = await insertLinkedinPerson({
      firstName,
      lastName,
      handle,
    });

    console.log(
      `[linkedin] created person ${createdPersonId} for ${handle} with a new id, ${id} is taken: ${error instanceof Error ? error.message : String(error)}`,
    );

    return createdPersonId;
  }
};
