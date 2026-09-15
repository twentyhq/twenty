import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  TEMPLATE_TARGET_COMPANY,
  TEMPLATE_TARGET_PERSON,
} from 'src/constants/universal-identifiers';
import { flattenRecord } from 'src/logic-functions/utils/render-template';

export type LoadedRecord = {
  found: boolean;
  displayName: string;
  values: Record<string, string>;
};

// Loads a Person or Company by id and returns its fields flattened into the
// dot-path tokens that templates reference (e.g. `name.firstName`, `jobTitle`).
export const loadRecordValues = async (
  client: CoreApiClient,
  target: string,
  recordId: string,
): Promise<LoadedRecord> => {
  // Filtered list queries (not the singular lookup) so a missing record
  // returns empty instead of throwing, letting the caller answer 404.
  if (target === TEMPLATE_TARGET_COMPANY) {
    const { companies } = await client.query({
      companies: {
        __args: { filter: { id: { eq: recordId } }, first: 1 },
        edges: {
          node: {
            id: true,
            name: true,
            employees: true,
            domainName: { primaryLinkUrl: true },
            address: { addressCity: true, addressCountry: true },
          },
        },
      },
    });

    const company = companies?.edges?.[0]?.node;

    if (!company?.id) {
      return { found: false, displayName: '', values: {} };
    }

    const { id: _id, ...fields } = company;

    return {
      found: true,
      displayName: company.name ?? 'Company',
      values: flattenRecord(fields as Record<string, unknown>),
    };
  }

  const { people } = await client.query({
    people: {
      __args: { filter: { id: { eq: recordId } }, first: 1 },
      edges: {
        node: {
          id: true,
          jobTitle: true,
          city: true,
          name: { firstName: true, lastName: true },
          emails: { primaryEmail: true },
          phones: { primaryPhoneNumber: true },
          linkedinLink: { primaryLinkUrl: true },
          company: { name: true },
        },
      },
    },
  });

  const person = people?.edges?.[0]?.node;

  if (!person?.id) {
    return { found: false, displayName: '', values: {} };
  }

  const { id: _id, ...fields } = person;
  const fullName = [person.name?.firstName, person.name?.lastName]
    .filter(Boolean)
    .join(' ');

  return {
    found: true,
    displayName: fullName.length > 0 ? fullName : 'Person',
    values: flattenRecord(fields as Record<string, unknown>),
  };
};

export const isSupportedTarget = (target: string): boolean =>
  target === TEMPLATE_TARGET_PERSON || target === TEMPLATE_TARGET_COMPANY;
