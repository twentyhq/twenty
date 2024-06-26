import { CompositeTypeNotFoundException } from 'src/engine/api/graphql/workspace-query-builder/exceptions/composite-type-not-found.exception';
import { FieldHasNoWorkspaceIdException } from 'src/engine/api/graphql/workspace-query-builder/exceptions/field-has-no-workspace-id.exception';
import { FieldIsNotRelationException } from 'src/engine/api/graphql/workspace-query-builder/exceptions/field-is-not-relation.exception';
import { FieldNotFound } from 'src/engine/api/graphql/workspace-query-builder/exceptions/field-not-found.exception';
import { RecordPositionQueryTypeInvalidException } from 'src/engine/api/graphql/workspace-query-builder/exceptions/record-position-query-type-invalid.exception';
import { RelationHasNoObjectException } from 'src/engine/api/graphql/workspace-query-builder/exceptions/relation-has-no-object.exception';
import { InvalidQueryInputException } from 'src/engine/api/graphql/workspace-query-runner/exceptions/invalid-query-input.exception';
import { InvalidUuidException } from 'src/engine/api/graphql/workspace-query-runner/exceptions/invalid-uuid.exception';
import { QueryTimeoutException } from 'src/engine/api/graphql/workspace-query-runner/exceptions/query-timeout.exception';
import { RecordsNotFoundException } from 'src/engine/api/graphql/workspace-query-runner/exceptions/records-not-found.exception';
import {
  InternalServerError,
  NotFoundError,
  TimeoutError,
  UserInputError,
  ValidationError,
} from 'src/engine/utils/graphql-errors.util';

export const workspaceResolverErrorHandler = (error: Error) => {
  if (
    error instanceof FieldIsNotRelationException ||
    error instanceof FieldHasNoWorkspaceIdException ||
    error instanceof RelationHasNoObjectException ||
    error instanceof CompositeTypeNotFoundException ||
    error instanceof RecordPositionQueryTypeInvalidException ||
    error instanceof FieldNotFound
  ) {
    throw new InternalServerError(error.message);
  }

  if (error instanceof InvalidQueryInputException) {
    throw new UserInputError(error.message);
  }

  if (error instanceof InvalidUuidException) {
    throw new ValidationError(error.message);
  }

  if (error instanceof RecordsNotFoundException) {
    throw new NotFoundError(error.message);
  }

  if (error instanceof QueryTimeoutException) {
    throw new TimeoutError(error.message);
  }

  throw error;
};
