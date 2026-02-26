import { enumCloudUser2ActivityStatusEnum } from 'twenty-sdk/generated';
import { z } from 'zod';

import { getApplicationConfig } from 'src/shared/application-config';
import { fetchFromClickHouse } from 'src/shared/clickhouse-client';
import { clickHouseDateToIso } from 'src/shared/clickhouse-date-to-iso';
import { twentyClient } from 'src/shared/twenty-client';

const clickHouseUserSchema = z.object({
  userId: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  fullName: z.string(),
  isEmailVerified: z.boolean(),
  disabled: z.boolean(),
  canImpersonate: z.boolean(),
  canAccessFullAdminPanel: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string(),
  locale: z.string(),
  createdDate: z.string(),
  workspaceCount: z.coerce.number(),
  workspaceIds: z.string(),
  workspaceDomains: z.string(),
  firstActivityDate: z.string(),
  lastActivityDate: z.string(),
  lastWorkspaceId: z.string(),
  totalPageviews: z.coerce.number(),
  pageviewsLast30d: z.coerce.number(),
  pageviewsLast7d: z.coerce.number(),
  pageviewsLast24h: z.coerce.number(),
  userAgeDays: z.coerce.number(),
  daysSinceLastActivity: z.coerce.number(),
  isActiveLast30d: z.boolean(),
  isActiveLast7d: z.boolean(),
  isActiveLast24h: z.boolean(),
  activityStatus: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(enumCloudUser2ActivityStatusEnum)),
  avgDailyPageviewsLast30d: z.coerce.number(),
  isTwenty: z.coerce.boolean(),
  maxWorkspaceMembers: z.coerce.number(),
  inTrial: z.boolean(),
});

type ClickHouseUser = z.infer<typeof clickHouseUserSchema>;

const fetchUsersFromClickHouse = async (): Promise<ClickHouseUser[]> => {
  const { clickHouseDatabase } = getApplicationConfig();

  // const nowDate = 'now()'
  const nowDate = "'2026-02-04 14:28:52.000'";

  const query = `
    SELECT
      *
    FROM
      ${clickHouseDatabase}.user
    WHERE
      lastActivityDate >= ${nowDate} - INTERVAL 500 MINUTE
        AND
      lastActivityDate <= ${nowDate}
    FORMAT
      JSONEachRow;
  `;

  return fetchFromClickHouse(query, clickHouseUserSchema);
};

const fetchAllPeopleFromTwentyByEmail = async (emails: string[]) => {
  if (emails.length === 0) {
    return [];
  }

  const allPeople = await twentyClient.query({
    people: {
      edges: {
        node: {
          id: true,
          emails: {
            primaryEmail: true,
          },
        },
      },
      __args: {
        filter: {
          emails: {
            primaryEmail: {
              in: emails,
            },
          },
        },
      },
    },
  });

  return allPeople.people?.edges.map((edge) => edge.node) ?? [];
};

const buildCloudUserInput = ({
  user,
  personId,
}: {
  user: ClickHouseUser;
  personId: string;
}) => ({
  id: user.userId,
  name: user.fullName,
  email: {
    primaryEmail: user.email,
  },
  personId,
  fullName: {
    lastName: user.lastName,
    firstName: user.firstName,
  },
  isTwenty: user.isTwenty,
  userTenure: user.userAgeDays,
  isActiveL7d: user.isActiveLast7d,
  isActiveL24h: user.isActiveLast24h,
  isActiveL30d: user.isActiveLast30d,
  pageViewsL7d: user.pageviewsLast7d,
  pageViewsL24h: user.pageviewsLast24h,
  pageViewsL30d: user.pageviewsLast30d,
  activityStatus: user.activityStatus,
  workspaceCount: user.workspaceCount,
  lastActivityDate: clickHouseDateToIso(user.lastActivityDate),
  dataLastUpdatedAt: new Date().toISOString(),
  avgDailyPageviewsLast30d: user.avgDailyPageviewsLast30d,
  daysSinceLastActivity: user.daysSinceLastActivity,
});

export const syncCloudUsers = async (): Promise<{
  syncedCount: number;
}> => {
  const users = await fetchUsersFromClickHouse();

  console.log('Fetched users from ClickHouse', users);

  const emails = users.map((user) => user.email);

  console.log('Fetching people from Twenty with emails', emails);

  const people = await fetchAllPeopleFromTwentyByEmail(emails);

  console.log('Fetched people from Twenty', people);

  // Build a map of email -> personId from existing people
  const emailToPersonId = new Map<string, string>();

  for (const person of people) {
    if (person.emails?.primaryEmail !== undefined) {
      emailToPersonId.set(person.emails.primaryEmail.toLowerCase(), person.id);
    }
  }

  // Partition users into those with/without an existing person
  const usersWithoutPerson = users.filter(
    (user) => !emailToPersonId.has(user.email.toLowerCase()),
  );

  // Step 1: Batch-create missing people
  const newlyCreatedPersonIds: string[] = [];

  if (usersWithoutPerson.length > 0) {
    console.log(`Batch-creating ${usersWithoutPerson.length} people records`);

    const createPeopleResult = await twentyClient.mutation({
      createPeople: {
        __args: {
          data: usersWithoutPerson.map((user) => ({
            name: {
              firstName: user.firstName,
              lastName: user.lastName,
            },
            emails: {
              primaryEmail: user.email,
            },
          })),
        },
        id: true,
        emails: {
          primaryEmail: true,
        },
      },
    });

    const createdPeople = createPeopleResult.createPeople ?? [];

    for (const person of createdPeople) {
      if (
        person.emails?.primaryEmail === undefined ||
        person.id === undefined
      ) {
        continue;
      }

      newlyCreatedPersonIds.push(person.id);
      emailToPersonId.set(person.emails.primaryEmail.toLowerCase(), person.id);
    }
  }

  // Step 2: Batch-upsert all cloud users, with rollback on failure
  const cloudUserInputs = users.map((user) => {
    const personId = emailToPersonId.get(user.email.toLowerCase());

    if (personId === undefined) {
      throw new Error(
        `No personId found for user ${user.email} — this should not happen`,
      );
    }

    return buildCloudUserInput({ user, personId });
  });

  try {
    console.log(`Batch-upserting ${cloudUserInputs.length} cloud users`);

    await twentyClient.mutation({
      createCloudUsers2: {
        __args: {
          data: cloudUserInputs,
          upsert: true,
        },
        __scalar: true,
      },
    });
  } catch (cloudUserError) {
    console.log(
      'Cloud user upsert failed, rolling back newly created people',
      cloudUserError,
    );

    // Rollback: hard-delete people that were created in step 1
    if (newlyCreatedPersonIds.length > 0) {
      try {
        await twentyClient.mutation({
          destroyPeople: {
            __args: {
              filter: {
                id: {
                  in: newlyCreatedPersonIds,
                },
              },
            },
            id: true,
          },
        });

        console.log(
          `Rolled back ${newlyCreatedPersonIds.length} newly created people`,
        );
      } catch (rollbackError) {
        console.log(
          'Rollback of newly created people also failed',
          rollbackError,
        );
      }
    }

    throw cloudUserError;
  }

  return { syncedCount: users.length };
};
