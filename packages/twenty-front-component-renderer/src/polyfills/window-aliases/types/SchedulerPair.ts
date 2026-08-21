import { type AnimationFrameScheduler } from '@/polyfills/window-aliases/types/AnimationFrameScheduler';
import { type IdleCallbackScheduler } from '@/polyfills/window-aliases/types/IdleCallbackScheduler';

export type SchedulerPair = AnimationFrameScheduler | IdleCallbackScheduler;
