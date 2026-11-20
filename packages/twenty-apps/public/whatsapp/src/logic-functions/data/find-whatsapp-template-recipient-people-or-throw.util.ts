import { CoreApiClient } from 'twenty-client-sdk/core';
import { SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS } from 'src/constants/send-template-to-people-max-recipients.constant';
import { type WhatsAppTemplateRecipientPerson } from 'src/logic-functions/types/whatsapp-template-recipient-person.type';

const PEOPLE_PAGE_SIZE = 200;

const PERSON_SELECTION = {
  id: true,
  whatsAppId: true,
  whatsAppUserId: true,
  whatsAppMarketingOptOut: true,
  phones: { primaryPhoneNumber: true, primaryPhoneCallingCode: true },
  name: { firstName: true, lastName: true },
  jobTitle: true,
  city: true,
  company: { name: true },
};

// a "select all" selection arrives as the view filter, so it is read page by page up to the cap
export const findWhatsAppTemplateRecipientPeopleOrThrow = async (
  recipients: { personIds: string[] } | { filter: Record<string, unknown> },
): Promise<WhatsAppTemplateRecipientPerson[]> => {
  const client = new CoreApiClient();
  const filter = 'personIds' in recipients ? { id: { in: recipients.personIds } } : recipients.filter;
  const people: WhatsAppTemplateRecipientPerson[] = [];
  let after: string | undefined;

  do {
    const { people: page } = await client.query({
      people: {
        __args: { filter, first: PEOPLE_PAGE_SIZE, ...(after !== undefined ? { after } : {}) },
        edges: { node: PERSON_SELECTION },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    for (const edge of page?.edges ?? []) {
      const person: WhatsAppTemplateRecipientPerson = edge.node;

      people.push(person);
    }

    if (people.length > SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS) {
      throw new Error(
        `The selection has more than ${SEND_TEMPLATE_TO_PEOPLE_MAX_RECIPIENTS} people. Narrow it down and send again.`,
      );
    }

    after = page?.pageInfo?.hasNextPage === true ? (page.pageInfo.endCursor ?? undefined) : undefined;
  } while (after !== undefined);

  return people;
};
