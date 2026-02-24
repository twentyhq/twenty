import { defineLogicFunction } from 'twenty-sdk';
import Twenty from 'twenty-sdk/generated';
import { z } from 'zod';

const client = new Twenty();

const applicationConfigSchema = z.object({
  CLICKHOUSE_DATABASE: z.string().nonempty(),
  CLICKHOUSE_URL: z.url(),
  CLICKHOUSE_USERNAME: z.string().nonempty(),
  CLICKHOUSE_PASSWORD: z.string().nonempty(),
});

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
  activityStatus: z.string().transform((val) => val.toUpperCase()),
  avgDailyPageviewsLast30d: z.coerce.number(),
  isTwenty: z.coerce.number(),
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

  const findUsersWithRecentActivity = `
    SELECT
      *
    FROM
      ${clickHouseDatabase}.user
    LIMIT
      20
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

  const users = z.array(clickHouseUserSchema).nonempty().parse(rows);

  return { users };
};

const fetchAllPeopleFromTwentyByEmail = async (emails: string[]) => {
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

const handler = async (): Promise<{ message: string }> => {
  try {
    const { users } = await fetchUsersFromClickHouse();

    const emails = users.map((user) => user.email);

    const people = await fetchAllPeopleFromTwentyByEmail(emails);

    return {
      message: `Successfully fetched ${users.length} users from ClickHouse`,
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
  timeoutSeconds: 5,
  handler,
  cronTriggerSettings: {
    pattern: '*/10 * * * *',
  },
});
