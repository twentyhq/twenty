export const INVENTORY_COVERAGE_LIMITS = [
  'Descriptor presence and shape only; all behavior is unverified.',
  'Global names, function statics, exposed prototypes, one level of data namespaces, and explicit safe factories. Nested object graphs are not recursively expanded.',
  'Statics, prototypes, and namespaces are expanded through globalThis. When window is a separate object, its values that differ from globalThis are listed as skipped instead of expanded.',
  'No arbitrary getters or constructors are invoked. Safe factories explicitly read selected browser accessors and create detached DOM nodes and inert platform objects.',
  'A catalog member without a property descriptor on a sandbox target is read once. That read reaches proxy traps but never an accessor; a defined result is reported uninspectable rather than missing.',
  'Local symbols cannot be matched across realms and are listed as skipped. Well-known and registered symbols retain stable identifiers.',
  'Only the configured Chromium environment is measured. Permissions, hardware, visual CSS, other browsers, and unexposed APIs are outside coverage.',
  'Sandbox-only targets and members are outside the reference comparison. Descriptor placement differences do not establish missing behavior.',
] as const;
