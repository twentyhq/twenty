import { simpleQuotesStringSchema } from '~/utils/validation-schemas/simpleQuotesStringSchema';

export const stripSimpleQuotesFromString = (value: string) =>
  simpleQuotesStringSchema.safeParse(value).success
    ? value.slice(1, -1)
    : value;
