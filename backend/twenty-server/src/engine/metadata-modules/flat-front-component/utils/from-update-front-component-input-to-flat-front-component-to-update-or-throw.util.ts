import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FLAT_FRONT_COMPONENT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-front-component/constants/flat-front-component-editable-properties.constant';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type UpdateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/update-front-component.input';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateFrontComponentInputToFlatFrontComponentToUpdateOrThrow =
  ({
    flatFrontComponentMaps,
    updateFrontComponentInput,
  }: {
    flatFrontComponentMaps: FlatEntityMaps<FlatFrontComponent>;
    updateFrontComponentInput: UpdateFrontComponentInput;
  }): FlatFrontComponent => {
    const existingFlatFrontComponent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: updateFrontComponentInput.id,
      flatEntityMaps: flatFrontComponentMaps,
    });

    if (!isDefined(existingFlatFrontComponent)) {
      throw new FrontComponentException(
        'Front component not found',
        FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
      );
    }

    return {
      ...mergeUpdateInExistingRecord({
        existing: existingFlatFrontComponent,
        properties: [...FLAT_FRONT_COMPONENT_EDITABLE_PROPERTIES],
        update: updateFrontComponentInput.update,
      }),
      updatedAt: new Date().toISOString(),
    };
  };
