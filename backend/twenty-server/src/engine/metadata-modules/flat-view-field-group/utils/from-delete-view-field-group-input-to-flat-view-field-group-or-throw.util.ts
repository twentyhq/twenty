import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type DeleteViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/delete-view-field-group.input';
import {
  ViewFieldGroupException,
  ViewFieldGroupExceptionCode,
} from 'src/engine/metadata-modules/view-field-group/exceptions/view-field-group.exception';
import { type UniversalFlatViewFieldGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field-group.type';

export const fromDeleteViewFieldGroupInputToFlatViewFieldGroupOrThrow = ({
  deleteViewFieldGroupInput: rawDeleteViewFieldGroupInput,
  flatViewFieldGroupMaps,
}: {
  deleteViewFieldGroupInput: DeleteViewFieldGroupInput;
  flatViewFieldGroupMaps: FlatViewFieldGroupMaps;
}): UniversalFlatViewFieldGroup => {
  const { id: viewFieldGroupId } = extractAndSanitizeObjectStringFields(
    rawDeleteViewFieldGroupInput,
    ['id'],
  );

  const existingFlatViewFieldGroupToDelete = findFlatEntityByIdInFlatEntityMaps(
    {
      flatEntityId: viewFieldGroupId,
      flatEntityMaps: flatViewFieldGroupMaps,
    },
  );

  if (!isDefined(existingFlatViewFieldGroupToDelete)) {
    throw new ViewFieldGroupException(
      t`View field group to delete not found`,
      ViewFieldGroupExceptionCode.VIEW_FIELD_GROUP_NOT_FOUND,
    );
  }

  return {
    ...existingFlatViewFieldGroupToDelete,
    deletedAt: new Date().toISOString(),
  };
};
