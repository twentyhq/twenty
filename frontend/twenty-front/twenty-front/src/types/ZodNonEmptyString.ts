import { z } from 'zod';

export const zodNonEmptyString = z.string().min(1);
