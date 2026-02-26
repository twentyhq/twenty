import { defineLogicFunction } from 'twenty-sdk';
import Twenty, { enumCloudUser2ActivityStatusEnum } from 'twenty-sdk/generated';
import { z } from 'zod';

const client = new Twenty();

const applicationConfigSchema = z.object({
  CLICKHOUSE_DATABASE: z.string().nonempty(),
  CLICKHOUSE_URL: z.url(),
  CLICKHOUSE_USERNAME: z.string().nonempty(),
  CLICKHOUSE_PASSWORD: z.string().nonempty(),
})

const getApplicationConfig = () => {
  const env = applicationConfigSchema.parse({
    CLICKHOUSE_DATABASE: process.env.CLICKHOUSE_DATABASE,
    CLICKHOUSE_URL: process.env.CLICKHOUSE_URL,
    CLICKHOUSE_USERNAME: process.env.CLICKHOUSE_USERNAME,
    CLICKHOUSE_PASSWORD: process.env.CLICKHOUSE_PASSWORD,
  });

  return {
    clickHouseDatabase: env.CLICKHOUSE_DATABASE,
    clickHouseUrl: env.CLICKHOUSE_URL,
    clickHouseUsername: env.CLICKHOUSE_USERNAME,
    clickHousePassword: env.CLICKHOUSE_PASSWORD,
  };
};

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

const fetchUsersFromClickHouse = async (): Promise<{
  users: ClickHouseUser[];
}> => {
  const {
    clickHouseDatabase,
    clickHouseUrl,
    clickHouseUsername,
    clickHousePassword,
  } = getApplicationConfig();

  // const nowDate = 'now()'
  const nowDate = "'2026-02-04 14:28:52.000'";

  const findUsersWithRecentActivity = `
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

  const res = await fetch(clickHouseUrl, {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${clickHouseUsername}:${clickHousePassword}`).toString(
          'base64',
        ),
      'Content-Type': 'text/plain',
    },
    body: findUsersWithRecentActivity,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ClickHouse error: ${res.status} - ${errText}`);
  }

  /**
   * Format is a list of JSON objects, one per line, so we need to split by line and parse each line as JSON.
   */
  const text = await res.text();

  const rows = text
    .trim()
    .split('\n')
    .filter((line) => line.trim()) // Filter out empty lines
    .map((line) => JSON.parse(line));

  const users = z.array(clickHouseUserSchema).parse(rows);

  return { users };
};

const fetchAllPeopleFromTwentyByEmail = async (emails: string[]) => {
  if (emails.length === 0) {
    return [];
  }

  const allPeople = await client.query({
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
  lastActivityDate: user.lastActivityDate,
  dataLastUpdatedAt: new Date().toISOString(),
  avgDailyPageviewsLast30d: user.avgDailyPageviewsLast30d,
  daysSinceLastActivity: user.daysSinceLastActivity,
});

const handler = async (): Promise<{ message: string }> => {
  try {
    const { users } = await fetchUsersFromClickHouse();

    console.log('fetch users from clickhouse', users);

    const emails = users.map((user) => user.email);

    console.log('fetch people from twenty with emails', emails);

    const people = await fetchAllPeopleFromTwentyByEmail(emails);

    console.log('fetched people from twenty', people);

    // Build a map of email -> personId from existing people
    const emailToPersonId = new Map<string, string>();

    for (const person of people) {
      if (person.emails?.primaryEmail !== undefined) {
        emailToPersonId.set(
          person.emails.primaryEmail.toLowerCase(),
          person.id,
        );
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

      const createPeopleResult = await client.mutation({
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
        emailToPersonId.set(
          person.emails.primaryEmail.toLowerCase(),
          person.id,
        );
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

      await client.mutation({
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
          await client.mutation({
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

    return {
      message: `Successfully processed ${users.length} users from ClickHouse`,
    };
  } catch (err) {
    console.log(err);

    throw err;
  }
};

export default defineLogicFunction({
  universalIdentifier: '3897e059-715e-4a4b-b165-c44f17d2e30a',
  name: 'product-data-create-users',
  description: 'A simple logic function',
  timeoutSeconds: 120,
  handler,
  cronTriggerSettings: {
    pattern: '*/10 * * * *',
  },
});
