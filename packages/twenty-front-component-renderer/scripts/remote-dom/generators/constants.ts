export const CUSTOM_ELEMENT_NAMES = {
  ROOT: 'remote-root',
  FRAGMENT: 'remote-fragment',
} as const;

export const INTERNAL_ELEMENT_CLASSES = {
  ROOT: 'RemoteRootElement',
  FRAGMENT: 'RemoteFragmentElement',
} as const;

export const OUTPUT_FILES = {
  REMOTE_ELEMENTS: 'remote-elements.ts',
  REMOTE_COMPONENTS: 'remote-components.ts',
  HOST_REGISTRY: 'host-component-registry.ts',
} as const;

export const TYPE_NAMES = {
  COMMON_PROPERTIES: 'HtmlCommonProperties',
  COMMON_EVENTS: 'HtmlCommonEvents',
  COMMON_PROPERTIES_CONFIG: 'HTML_COMMON_PROPERTIES_CONFIG',
  COMMON_EVENTS_ARRAY: 'HTML_COMMON_EVENTS_ARRAY',
  EMPTY_RECORD: 'Record<string, never>',
} as const;
