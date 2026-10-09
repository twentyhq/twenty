import { type EventRefProperties } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/event-ref-properties.type';
import { type RefCallback } from '@/cli/utilities/build/common/front-component-build/jsx-runtime/types/ref-callback.type';

export type EventRef = RefCallback & EventRefProperties;
