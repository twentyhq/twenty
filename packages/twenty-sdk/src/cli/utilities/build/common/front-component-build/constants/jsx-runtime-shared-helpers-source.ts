import { JSX_RUNTIME_CHAIN_EVENT_HANDLERS_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-chain-event-handlers-source';
import { JSX_RUNTIME_CUSTOM_ELEMENT_TAGS_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-custom-element-tags-source';
import { JSX_RUNTIME_ELEMENT_EVENT_LISTENER_REGISTRY_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-element-event-listener-registry-source';
import { JSX_RUNTIME_EVENT_LISTENER_DESCRIPTOR_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-event-listener-descriptor-source';
import { JSX_RUNTIME_EVENT_REF_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-event-ref-source';
import { JSX_RUNTIME_MEMOIZED_EVENT_REF_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-memoized-event-ref-source';
import { JSX_RUNTIME_NESTED_CLONE_EVENTS_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-nested-clone-events-source';
import { JSX_RUNTIME_SPLIT_EVENT_PROPS_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-split-event-props-source';
import { JSX_RUNTIME_STYLE_INJECTION_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-style-injection-source';
import { JSX_RUNTIME_WITH_EVENT_REF_SOURCE } from '@/cli/utilities/build/common/front-component-build/constants/jsx-runtime-with-event-ref-source';

export const JSX_RUNTIME_SHARED_HELPERS_SOURCE = [
  JSX_RUNTIME_CUSTOM_ELEMENT_TAGS_SOURCE,
  JSX_RUNTIME_STYLE_INJECTION_SOURCE,
  JSX_RUNTIME_SPLIT_EVENT_PROPS_SOURCE,
  JSX_RUNTIME_EVENT_LISTENER_DESCRIPTOR_SOURCE,
  JSX_RUNTIME_CHAIN_EVENT_HANDLERS_SOURCE,
  JSX_RUNTIME_ELEMENT_EVENT_LISTENER_REGISTRY_SOURCE,
  JSX_RUNTIME_EVENT_REF_SOURCE,
  JSX_RUNTIME_MEMOIZED_EVENT_REF_SOURCE,
  JSX_RUNTIME_NESTED_CLONE_EVENTS_SOURCE,
  JSX_RUNTIME_WITH_EVENT_REF_SOURCE,
].join('\n\n');
