import { z } from 'zod';
import { pageviewSchema } from '../events';
import { CommonPropertiesType } from '@/types/common.type';

export type Pageview = z.infer<typeof pageviewSchema>;
export type PageviewWithoutCommonKeys = Omit<Pageview, CommonPropertiesType>;
