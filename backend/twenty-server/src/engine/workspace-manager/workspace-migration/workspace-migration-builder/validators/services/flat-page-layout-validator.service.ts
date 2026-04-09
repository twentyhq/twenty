import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

const PAGE_LAYOUT_EXCEPTION_CODE = {
  PAGE_LAYOUT_NOT_FOUND: 'PAGE_LAYOUT_NOT_FOUND',
} as const;

@Injectable()
export class FlatPageLayoutValidatorService {
  public validateFlatPageLayoutCreation({
    flatEntityToValidate: flatPageLayout,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayout
  >): FailedFlatEntityValidation<'pageLayout', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatPageLayout.universalIdentifier,
        name: flatPageLayout.name,
      },
      metadataName: 'pageLayout',
      type: 'create',
    });

    return validationResult;
  }

  public validateFlatPageLayoutDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutMaps: optimisticFlatPageLayoutMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.pageLayout
  >): FailedFlatEntityValidation<'pageLayout', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'pageLayout',
      type: 'delete',
    });

    const existingPageLayout = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatPageLayoutMaps,
    });

    if (!isDefined(existingPageLayout)) {
      validationResult.errors.push({
        code: PAGE_LAYOUT_EXCEPTION_CODE.PAGE_LAYOUT_NOT_FOUND,
        message: t`Page layout not found`,
        userFriendlyMessage: msg`Page layout not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public validateFlatPageLayoutUpdate({
    universalIdentifier,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPageLayoutMaps: optimisticFlatPageLayoutMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.pageLayout
  >): FailedFlatEntityValidation<'pageLayout', 'update'> {
    const fromFlatPageLayout = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatPageLayoutMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'pageLayout',
      type: 'update',
    });

    if (!isDefined(fromFlatPageLayout)) {
      validationResult.errors.push({
        code: PAGE_LAYOUT_EXCEPTION_CODE.PAGE_LAYOUT_NOT_FOUND,
        message: t`Page layout not found`,
        userFriendlyMessage: msg`Page layout not found`,
      });

      return validationResult;
    }

    return validationResult;
  }
}
