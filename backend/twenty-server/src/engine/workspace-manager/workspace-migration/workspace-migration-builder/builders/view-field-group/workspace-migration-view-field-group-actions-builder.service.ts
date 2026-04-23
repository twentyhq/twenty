import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateViewFieldGroupAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field-group/types/workspace-migration-view-field-group-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatViewFieldGroupValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-field-group-validator.service';

@Injectable()
export class WorkspaceMigrationViewFieldGroupActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.viewFieldGroup
> {
  constructor(
    private readonly flatViewFieldGroupValidatorService: FlatViewFieldGroupValidatorService,
  ) {
    super(ALL_METADATA_NAME.viewFieldGroup);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.viewFieldGroup
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFieldGroup,
    'create'
  > {
    const validationResult =
      this.flatViewFieldGroupValidatorService.validateFlatViewFieldGroupCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'viewFieldGroup',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.viewFieldGroup
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFieldGroup,
    'delete'
  > {
    const validationResult =
      this.flatViewFieldGroupValidatorService.validateFlatViewFieldGroupDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'viewFieldGroup',
        universalIdentifier: args.flatEntityToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.viewFieldGroup
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.viewFieldGroup,
    'update'
  > {
    const validationResult =
      this.flatViewFieldGroupValidatorService.validateFlatViewFieldGroupUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateAction: UniversalUpdateViewFieldGroupAction = {
      type: 'update',
      metadataName: 'viewFieldGroup',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateAction,
    };
  }
}
