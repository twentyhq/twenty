import { WorkspaceMigrationV2ExceptionCode } from 'twenty-shared/metadata';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { isUserFacingToolExecutionError } from 'src/engine/core-modules/tool-provider/utils/is-user-facing-tool-execution-error.util';
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
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import {
  RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import {
  WebhookException,
  WebhookExceptionCode,
} from 'src/engine/metadata-modules/webhook/webhook.exception';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { WorkspaceMigrationV2Exception } from 'src/engine/workspace-manager/workspace-migration.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

describe('isUserFacingToolExecutionError', () => {
  it.each([
    [
      'a metadata validation failure',
      new WorkspaceMigrationBuilderException({} as never),
      true,
    ],
    [
      'a view the model referenced that does not exist',
      new ViewException('View not found', ViewExceptionCode.VIEW_NOT_FOUND),
      true,
    ],
    [
      'a view missing right after its own upsert',
      new ViewException(
        'View not found after upsert',
        ViewExceptionCode.INTERNAL_SERVER_ERROR,
      ),
      false,
    ],
    [
      'a migration blocked during a hot upgrade',
      new WorkspaceMigrationRunnerException({
        message: 'Workspace schema DDL changes are locked',
        code: WorkspaceMigrationRunnerExceptionCode.DDL_LOCKED,
      }),
      true,
    ],
    [
      'a migration whose application is missing from the cache',
      new WorkspaceMigrationRunnerException({
        message: 'Could not find application',
        code: WorkspaceMigrationRunnerExceptionCode.APPLICATION_NOT_FOUND,
      }),
      false,
    ],
    [
      'a database input error',
      new TwentyOrmException(
        'Unknown column',
        TwentyOrmExceptionCode.UNKNOWN_COLUMN,
      ),
      true,
    ],
    [
      'a database read timeout',
      new TwentyOrmException(
        'Query read timeout',
        TwentyOrmExceptionCode.QUERY_READ_TIMEOUT,
      ),
      false,
    ],
    [
      'a disabled logic function',
      new LogicFunctionException(
        'Disabled',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
      ),
      true,
    ],
    [
      'a logic function build timing out on the platform',
      new LogicFunctionException(
        'Lambda timed out during BUILD',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_EXECUTION_TIMEOUT,
      ),
      false,
    ],
    [
      'an object the model referenced that does not exist',
      new ObjectMetadataException(
        'Object not found',
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      ),
      true,
    ],
    [
      'a field the model referenced that does not exist',
      new FieldMetadataException(
        'Field not found',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      ),
      true,
    ],
    [
      'a relation id the model passed that does not exist',
      new FlatEntityMapsException(
        'Could not find fieldMetadata for given fieldMetadataId',
        FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
      ),
      true,
    ],
    [
      'an entity missing from the cache after a migration',
      new FlatEntityMapsException(
        'Could not find flat entity in maps',
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      ),
      false,
    ],
    [
      'a chat thread deleted during the turn',
      new AiException('Thread is deleted', AiExceptionCode.THREAD_NOT_FOUND),
      true,
    ],
    [
      'an agent the model referenced that does not exist',
      new AiException('Agent not found', AiExceptionCode.AGENT_NOT_FOUND),
      true,
    ],
    [
      'an agent change the model is not allowed to make',
      new AiException(
        'This agent is managed by a workflow AI step',
        AiExceptionCode.INVALID_AGENT_INPUT,
      ),
      true,
    ],
    [
      'an agent run that failed',
      new AiException(
        'Agent execution failed',
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      ),
      false,
    ],
    [
      'a webhook the model referenced that does not exist',
      new WebhookException(
        'Webhook not found',
        WebhookExceptionCode.WEBHOOK_NOT_FOUND,
      ),
      true,
    ],
    [
      'a role change that would lock the caller out',
      new PermissionsException(
        PermissionsExceptionMessage.CANNOT_REVOKE_OWN_SETTINGS_ACCESS,
        PermissionsExceptionCode.CANNOT_REVOKE_OWN_SETTINGS_ACCESS,
      ),
      true,
    ],
    [
      'a workspace missing its default role',
      new PermissionsException(
        PermissionsExceptionMessage.DEFAULT_ROLE_NOT_FOUND,
        PermissionsExceptionCode.DEFAULT_ROLE_NOT_FOUND,
      ),
      false,
    ],
    [
      'a row-level rule owned by another role',
      new RowLevelPermissionPredicateException(
        'Predicate belongs to a different role or object',
        RowLevelPermissionPredicateExceptionCode.UNAUTHORIZED_ROLE_MODIFICATION,
      ),
      true,
    ],
    [
      'a row-level rule internal failure',
      new RowLevelPermissionPredicateException(
        'Unexpected failure',
        RowLevelPermissionPredicateExceptionCode.INTERNAL_SERVER_ERROR,
      ),
      false,
    ],
    [
      'a sender removed from the workspace during the turn',
      new AuthException(
        'User workspace not found',
        AuthExceptionCode.UNAUTHENTICATED,
      ),
      true,
    ],
    [
      'a validator crash wrapped by the migration builder',
      new WorkspaceMigrationV2Exception(
        'Could not find flat entity with universal identifier',
        WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR,
      ),
      false,
    ],
    [
      'a plain runtime error',
      new TypeError("Cannot read properties of undefined (reading 'id')"),
      false,
    ],
  ])('should classify %s', (_, error, isUserFacing) => {
    expect(isUserFacingToolExecutionError(error)).toBe(isUserFacing);
  });
});
