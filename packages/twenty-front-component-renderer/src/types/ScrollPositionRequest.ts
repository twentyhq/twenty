import { type ScrollAxisOffsets } from '@/types/ScrollAxisOffsets';

export type ScrollPositionRequest = { method: 'scrollTo' } & ScrollAxisOffsets;
