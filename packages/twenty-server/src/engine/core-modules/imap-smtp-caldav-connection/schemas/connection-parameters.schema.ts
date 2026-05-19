import { z } from 'zod';

export const connectionParametersSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  port: z.int().positive('Port must be a positive number'),
  username: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  secure: z.boolean().optional(),
});
