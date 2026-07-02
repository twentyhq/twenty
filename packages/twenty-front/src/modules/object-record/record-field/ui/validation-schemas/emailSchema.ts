import { z } from 'zod';

export const emailSchema = z.email().max(255);
