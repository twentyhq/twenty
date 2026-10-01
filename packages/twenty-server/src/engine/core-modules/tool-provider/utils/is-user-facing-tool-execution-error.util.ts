import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { isUsageRefusedError } from 'src/engine/core-modules/billing/utils/is-usage-refused-error.util';
import { USER_FACING_FIELD_METADATA_EXCEPTION_CODES } from 'src/engine/core-modules/tool-provider/constants/user-facing-field-metadata-exception-codes.constant';
import { USER_FACING_LOGIC_FUNCTION_EXCEPTION_CODES } from 'src/engine/core-modules/tool-provider/constants/user-facing-logic-function-exception-codes.constant';
import { USER_FACING_OBJECT_METADATA_EXCEPTION_CODES } from 'src/engine/core-modules/tool-provider/constants/user-facing-object-metadata-exception-codes.constant';
import { USER_FACING_WORKSPACE_MIGRATION_RUNNER_EXCEPTION_CODES } from 'src/engine/core-modules/tool-provider/constants/user-facing-workspace-migration-runner-exception-codes.constant';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { LogicFunctionException } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { ObjectMetadataException } from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { ViewFieldException } from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { ViewFilterException } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { ViewSortException } from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { ViewException } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { TwentyOrmException } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { isTwentyOrmUserInputError } from 'src/engine/twenty-orm/utils/is-twenty-orm-user-input-error.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

export const isUserFacingToolExecutionError = (error: unknown): boolean => {
  if (
    error instanceof WorkspaceMigrationBuilderException ||
    error instanceof ViewException ||
    error instanceof ViewFieldException ||
    error instanceof ViewFilterException ||
    error instanceof ViewSortException ||
    isUsageRefusedError(error)
  ) {
    return true;
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
    return error.code === AiExceptionCode.THREAD_NOT_FOUND;
  }

  if (error instanceof AuthException) {
    return error.code === AuthExceptionCode.UNAUTHENTICATED;
  }

  return false;
};
