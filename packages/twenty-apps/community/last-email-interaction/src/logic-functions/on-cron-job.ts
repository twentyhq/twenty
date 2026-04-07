import { defineLogicFunction } from 'twenty-sdk';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { calculateStatus } from '../shared/calculate-status';

const fetchAllPeople = async () => {
  const client = new CoreApiClient();
  const result = await client.query({
    people: {
      __args: {
        filter: {
          /*
          lastInteraction: {
            is: 'NOT_NULL',
          },
          */
        },
      },
      edges: {
        node: {
          id: true,
          lastInteraction: true,
          interactionStatus: true,
        },
      },
    },
  });
  if (!result.people) {
    throw new Error('Could not find any people');
  }
  return result.people.edges;
}

const fetchAllCompanies = async () => {
  const client = new CoreApiClient();
  const result = await client.query({
    companies: {
      __args: {
        filter: {
          /* how to fetch fields added in fields folder?
          lastInteraction: {
            is: 'NOT_NULL',
          },
          */
        },
      },
      edges: {
        node: {
          id: true,
          lastInteraction: true,
          interactionStatus: true,
        },
      },
    },
  });
  if (!result.companies) {
    throw new Error('Could not find any companies');
  }
  return result.companies.edges;
}

const updateCompany = async (
  companyId: string,
  updateData: Record<string, string>,
) => {
  const client = new CoreApiClient();
  const result = await client.mutation({
    updateCompany: {
      __args: {
        id: companyId,
        data: updateData,
      },
      id: true,
    },
  });
  if (!result.updateCompany) {
    throw new Error(`Failed to update company ${companyId}`);
  }
};

const updatePerson = async (
  personId: string,
  updateData: Record<string, string>,
) => {
  const client = new CoreApiClient();
  const result = await client.mutation({
    updatePerson: {
      __args: {
        id: personId,
        data: updateData,
      },
      id: true,
    },
  });
  if (!result.updatePerson) {
    throw new Error(`Failed to update person ${personId}`);
  }
};

const handler = async () => {
  const people = await fetchAllPeople();
  for (const person of people) {
    const interactionStatus = calculateStatus(person.node.lastInteraction as string);
    if (interactionStatus !== person.node.interactionStatus) {
      await updatePerson(person.node.id, {interactionStatus: interactionStatus});
    }
  }
  const companies = await fetchAllCompanies();
  for (const company of companies) {
    const interactionStatus = calculateStatus(company.node.lastInteraction as string);
    if (interactionStatus !== company.node.interactionStatus) {
      await updateCompany(company.node.id, {interactionStatus: interactionStatus});
    }
  }
};

export default defineLogicFunction({
  universalIdentifier: 'c79f1f30-f369-4264-9e5b-c183577bc709',
  name: 'on-cron-job',
  description:
    'Runs daily at midnight and updates all companies and people with correct interaction status',
  timeoutSeconds: 5,
  handler,
  cronTriggerSettings: {
    pattern: '0 0 * * *', // runs daily at midnight
  },
});
