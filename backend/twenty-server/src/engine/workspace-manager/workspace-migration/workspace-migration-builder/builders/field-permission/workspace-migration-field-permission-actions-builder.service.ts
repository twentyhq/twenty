import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { UniversalUpdateFieldPermissionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field-permission/types/workspace-migration-field-permission-action.type';
import { FlatFieldPermissionValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-field-permission-validator.service';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';

@Injectable()
export class WorkspaceMigrationFieldPermissionActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.fieldPermission
> {
  constructor(
    private readonly flatFieldPermissionValidatorService: FlatFieldPermissionValidatorService,
  ) {
    super(ALL_METADATA_NAME.fieldPermission);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.fieldPermission
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldPermission,
    'create'
  > {
    const validationResult =
      this.flatFieldPermissionValidatorService.validateFlatFieldPermissionCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFieldPermissionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'fieldPermission',
        flatEntity: flatFieldPermissionToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.fieldPermission
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldPermission,
    'delete'
  > {
    const validationResult =
      this.flatFieldPermissionValidatorService.validateFlatFieldPermissionDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatFieldPermissionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'fieldPermission',
        universalIdentifier: flatFieldPermissionToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.fieldPermission
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.fieldPermission,
    'update'
  > {
    const validationResult =
      this.flatFieldPermissionValidatorService.validateFlatFieldPermissionUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateFieldPermissionAction: UniversalUpdateFieldPermissionAction = {
      type: 'update',
      metadataName: 'fieldPermission',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateFieldPermissionAction,
    };
  }
}
