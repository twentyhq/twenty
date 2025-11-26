import { ViewSortDirection } from '~/generated/graphql';
import z from 'zod';

export const sortUrlQueryParamsSchema = z.object({
  sort: z
    .record(z.string(), z.enum([ViewSortDirection.ASC, ViewSortDirection.DESC]))
    .optional(),
});

export type SortQueryParams = z.infer<typeof sortUrlQueryParamsSchema>;
