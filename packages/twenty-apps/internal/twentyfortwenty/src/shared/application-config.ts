import { z } from 'zod';

const applicationConfigSchema = z
  .object({
    CLICKHOUSE_DATABASE: z.string().nonempty(),
    CLICKHOUSE_URL: z.url(),
    CLICKHOUSE_USERNAME: z.string().nonempty(),
    CLICKHOUSE_PASSWORD: z.string().nonempty(),
  });

export const getApplicationConfig = () => {
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
