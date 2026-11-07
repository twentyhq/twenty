import { type ScrollIntoViewRequest } from '@/types/ScrollIntoViewRequest';
import { type ScrollPositionRequest } from '@/types/ScrollPositionRequest';

export type ScrollRequest = ScrollPositionRequest | ScrollIntoViewRequest;
