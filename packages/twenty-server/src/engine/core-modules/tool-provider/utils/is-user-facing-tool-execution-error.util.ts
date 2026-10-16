import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { isUsageRefusedError } from 'src/engine/core-modules/billing/utils/is-usage-refused-error.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import {
  RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { ViewFieldException } from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { ViewFilterException } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { ViewSortException } from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { WebhookException } from 'src/engine/metadata-modules/webhook/webhook.exception';
import { TwentyOrmException } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { isTwentyOrmUserInputError } from 'src/engine/twenty-orm/utils/is-twenty-orm-user-input-error.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

const USER_FACING_WORKSPACE_MIGRATION_RUNNER_EXCEPTION_CODES: (keyof typeof WorkspaceMigrationRunnerExceptionCode)[] =
  [
    WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
    WorkspaceMigrationRunnerExceptionCode.DDL_LOCKED,
  ];

const USER_FACING_LOGIC_FUNCTION_EXCEPTION_CODES = [
  LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
  LogicFunctionExceptionCode.LOGIC_FUNCTION_COMPILATION_FAILED,
  LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
  LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
];

const USER_FACING_OBJECT_METADATA_EXCEPTION_CODES = [
  ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
  ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
];

const USER_FACING_FIELD_METADATA_EXCEPTION_CODES: FieldMetadataExceptionCode[] =
  [
    FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
  ];

const USER_FACING_AI_EXCEPTION_CODES = [
  AiExceptionCode.THREAD_NOT_FOUND,
  AiExceptionCode.AGENT_NOT_FOUND,
  AiExceptionCode.AGENT_ALREADY_EXISTS,
  AiExceptionCode.AGENT_IS_STANDARD,
  AiExceptionCode.INVALID_AGENT_INPUT,
  AiExceptionCode.ROLE_NOT_FOUND,
  AiExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS,
];

const USER_FACING_PERMISSIONS_EXCEPTION_CODES = [
  PermissionsExceptionCode.PERMISSION_DENIED,
  PermissionsExceptionCode.ROLE_LABEL_ALREADY_EXISTS,
  PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN,
  PermissionsExceptionCode.CANNOT_UPDATE_SELF_ROLE,
  PermissionsExceptionCode.CANNOT_DELETE_OWN_ROLE,
  PermissionsExceptionCode.CANNOT_REVOKE_OWN_SETTINGS_ACCESS,
  PermissionsExceptionCode.CANNOT_DELETE_LAST_ADMIN_USER,
  PermissionsExceptionCode.ROLE_NOT_EDITABLE,
  PermissionsExceptionCode.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT,
  PermissionsExceptionCode.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
  PermissionsExceptionCode.INVALID_ARG,
  PermissionsExceptionCode.INVALID_SETTING,
  PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT,
  PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_WITHOUT_READING_PERMISSION,
  PermissionsExceptionCode.ONLY_FIELD_RESTRICTION_ALLOWED,
  PermissionsExceptionCode.FIELD_RESTRICTION_ONLY_ALLOWED_ON_READABLE_OBJECT,
  PermissionsExceptionCode.FIELD_RESTRICTION_ON_UPDATE_ONLY_ALLOWED_ON_UPDATABLE_OBJECT,
  PermissionsExceptionCode.EMPTY_FIELD_PERMISSION_NOT_ALLOWED,
  PermissionsExceptionCode.ROLE_MUST_HAVE_AT_LEAST_ONE_TARGET,
  PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_USERS,
  PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS,
  PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS,
  PermissionsExceptionCode.ROLE_NOT_FOUND,
  PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
  PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
  PermissionsExceptionCode.FIELD_PERMISSION_NOT_FOUND,
  PermissionsExceptionCode.PERMISSION_NOT_FOUND,
];

// TODO: this allowlist duplicates the per-domain classification already done by the REST
// and GraphQL exception filters. Refactor their code-to-status
// mapping into shared utils and rely on them here, capturing only 5xx.
export const isUserFacingToolExecutionError = (error: unknown): boolean => {
  if (
    error instanceof WorkspaceMigrationBuilderException ||
    error instanceof ViewFieldException ||
    error instanceof ViewFilterException ||
    error instanceof ViewSortException ||
    error instanceof WebhookException ||
    isUsageRefusedError(error)
  ) {
    return true;
  }

  if (error instanceof ViewException) {
    return error.code !== ViewExceptionCode.INTERNAL_SERVER_ERROR;
  }

  if (error instanceof WorkspaceMigrationRunnerException) {
    return USER_FACING_WORKSPACE_MIGRATION_RUNNER_EXCEPTION_CODES.includes(
      error.code,
    );
  }

  if (error instanceof TwentyOrmException) {
    return isTwentyOrmUserInputError(error);
  }

  if (error instanceof LogicFunctionException) {
    return USER_FACING_LOGIC_FUNCTION_EXCEPTION_CODES.includes(error.code);
  }

  if (error instanceof ObjectMetadataException) {
    return USER_FACING_OBJECT_METADATA_EXCEPTION_CODES.includes(error.code);
  }

  if (error instanceof FieldMetadataException) {
    return USER_FACING_FIELD_METADATA_EXCEPTION_CODES.includes(error.code);
  }

  if (error instanceof FlatEntityMapsException) {
    return (
      error.code ===
      FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND
    );
  }

  if (error instanceof AiException) {
    return USER_FACING_AI_EXCEPTION_CODES.includes(error.code);
  }

  if (error instanceof PermissionsException) {
    return USER_FACING_PERMISSIONS_EXCEPTION_CODES.includes(error.code);
  }

  if (error instanceof RowLevelPermissionPredicateException) {
    return (
      error.code !==
      RowLevelPermissionPredicateExceptionCode.INTERNAL_SERVER_ERROR
    );
  }

  if (error instanceof AuthException) {
    return error.code === AuthExceptionCode.UNAUTHENTICATED;
  }

  return false;
};
