// Injection token used to decouple consumers (e.g. workspace-migration
// action handlers) from the LogicFunctionDriverFactory class at the
// TypeScript source-import level. Importing the class directly drags the
// SdkClient chain into the migration runner module graph, which then loops
// back through PermissionsService -> ApiKeyRoleService -> RoleTargetService.
// Consumers `import type { LogicFunctionDriverFactory }` for typing only
// and inject by this token; the LogicFunctionModule registers the alias.
export const LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN =
  'LOGIC_FUNCTION_DRIVER_FACTORY';
