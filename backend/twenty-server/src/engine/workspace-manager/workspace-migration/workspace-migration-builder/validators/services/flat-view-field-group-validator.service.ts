import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatViewFieldGroupValidatorService {
  public validateFlatViewFieldGroupCreation({
    flatEntityToValidate: flatViewFieldGroupToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFieldGroupMaps: optimisticFlatViewFieldGroupMaps,
      flatViewMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFieldGroup
  >): FailedFlatEntityValidation<'viewFieldGroup', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatViewFieldGroupToValidate.universalIdentifier,
        viewUniversalIdentifier:
          flatViewFieldGroupToValidate.viewUniversalIdentifier,
      },
      metadataName: 'viewFieldGroup',
      type: 'create',
    });

    const existingFlatViewFieldGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewFieldGroupToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatViewFieldGroupMaps,
    });

    if (isDefined(existingFlatViewFieldGroup)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field group with this universal identifier already exists`,
        userFriendlyMessage: msg`View field group already exists`,
      });
    }

    const flatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatViewFieldGroupToValidate.viewUniversalIdentifier,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View not found`,
        userFriendlyMessage: msg`View not found`,
      });
    }

    return validationResult;
  }

  public validateFlatViewFieldGroupDeletion({
    flatEntityToValidate: { universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFieldGroupMaps: optimisticFlatViewFieldGroupMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.viewFieldGroup
  >): FailedFlatEntityValidation<'viewFieldGroup', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'viewFieldGroup',
      type: 'delete',
    });

    const existingFlatViewFieldGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewFieldGroupMaps,
    });

    if (!isDefined(existingFlatViewFieldGroup)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field group to delete not found`,
        userFriendlyMessage: msg`View field group to delete not found`,
      });
    }

    return validationResult;
  }

  public validateFlatViewFieldGroupUpdate({
    universalIdentifier,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewFieldGroupMaps: optimisticFlatViewFieldGroupMaps,
      flatViewMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.viewFieldGroup
  >): FailedFlatEntityValidation<'viewFieldGroup', 'update'> {
    const existingFlatViewFieldGroup = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatViewFieldGroupMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'viewFieldGroup',
      type: 'update',
    });

    if (!isDefined(existingFlatViewFieldGroup)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field group to update not found`,
        userFriendlyMessage: msg`View field group to update not found`,
      });

      return validationResult;
    }

    const flatView = findFlatEntityByUniversalIdentifier({
      universalIdentifier: existingFlatViewFieldGroup.viewUniversalIdentifier,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView)) {
      validationResult.errors.push({
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field group parent view not found`,
        userFriendlyMessage: msg`View field group parent view not found`,
      });
    }

    return validationResult;
  }
}
