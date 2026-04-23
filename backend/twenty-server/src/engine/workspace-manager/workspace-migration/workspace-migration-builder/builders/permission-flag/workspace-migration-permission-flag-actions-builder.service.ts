import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { UniversalUpdatePermissionFlagAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag/types/workspace-migration-permission-flag-action.type';
import { FlatPermissionFlagValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-permission-flag-validator.service';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';

@Injectable()
export class WorkspaceMigrationPermissionFlagActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.permissionFlag
> {
  constructor(
    private readonly flatPermissionFlagValidatorService: FlatPermissionFlagValidatorService,
  ) {
    super(ALL_METADATA_NAME.permissionFlag);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlag
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlag,
    'create'
  > {
    const validationResult =
      this.flatPermissionFlagValidatorService.validateFlatPermissionFlagCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPermissionFlagToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'permissionFlag',
        flatEntity: flatPermissionFlagToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlag
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlag,
    'delete'
  > {
    const validationResult =
      this.flatPermissionFlagValidatorService.validateFlatPermissionFlagDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPermissionFlagToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'permissionFlag',
        universalIdentifier: flatPermissionFlagToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlag
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlag,
    'update'
  > {
    const validationResult =
      this.flatPermissionFlagValidatorService.validateFlatPermissionFlagUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updatePermissionFlagAction: UniversalUpdatePermissionFlagAction = {
      type: 'update',
      metadataName: 'permissionFlag',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updatePermissionFlagAction,
    };
  }
}
