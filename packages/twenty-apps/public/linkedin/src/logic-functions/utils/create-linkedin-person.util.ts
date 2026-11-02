import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findPersonIdsByLinkedinHandle } from 'src/logic-functions/utils/find-person-ids-by-linkedin-handle.util';
import { getLinkedinPersonId } from 'src/logic-functions/utils/get-linkedin-person-id.util';
import { getLinkedinProfileSlug } from 'src/logic-functions/utils/get-linkedin-profile-slug.util';

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
    const { createPerson } = await new CoreApiClient({
      runAs: 'application',
    }).mutation({
      createPerson: {
        __args: {
          data: {
            id,
            name: { firstName, lastName },
            linkedinLink: { primaryLinkUrl: handle },
          },
        },
        id: true,
      },
    });

    if (isDefined(createPerson)) {
      console.log(
        `[linkedin] created person ${createPerson.id} for ${handle} (slug ${slug}, requested id ${id})`,
      );

      return createPerson.id;
    }
  } catch (error) {
    const [existingPersonId] = await findPersonIdsByLinkedinHandle(handle);

    if (isDefined(existingPersonId)) {
      console.log(
        `[linkedin] reused person ${existingPersonId} for ${handle} after create failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return existingPersonId;
    }

    throw error;
  }

  throw new Error(`Could not create the person for ${handle}`);
};
