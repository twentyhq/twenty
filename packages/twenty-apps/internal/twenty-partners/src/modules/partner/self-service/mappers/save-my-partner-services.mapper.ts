import { z } from 'zod';

export const saveServicesSchema = z.object({
  services: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string(),
      description: z.string(),
      sortOrder: z.number().optional(),
    }),
  ),
});

export type SaveServicesInput = z.infer<typeof saveServicesSchema>;

export type ServiceRow = {
  id: string;
  title: string | null;
  description: string | null;
  sortOrder: number | null;
};
