import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

export const buildMorphRelationHeadViewFieldCopies = ({
  headByRepresentativeId,
  workspaceCustomApplicationUniversalIdentifier,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
}: {
  headByRepresentativeId: Map<string, FlatFieldMetadata>;
  workspaceCustomApplicationUniversalIdentifier: string;
  flatViewFieldMaps: FlatEntityMaps<FlatViewField>;
  flatViewFieldGroupMaps: FlatEntityMaps<FlatViewFieldGroup>;
}): FlatViewField[] => {
  const viewFields = Object.values(flatViewFieldMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((viewField) => !isDefined(viewField.deletedAt));
  const viewFieldKeys = new Set(
    viewFields.map(
      (viewField) => `${viewField.viewId}:${viewField.fieldMetadataId}`,
    ),
  );

  return viewFields.flatMap((viewField) => {
    const head = headByRepresentativeId.get(viewField.fieldMetadataId);
    const headKey = `${viewField.viewId}:${head?.id}`;

    if (!isDefined(head) || viewFieldKeys.has(headKey)) {
      return [];
    }

    viewFieldKeys.add(headKey);

    const {
      isVisible,
      size,
      position,
      aggregateOperation,
      viewFieldGroupId,
      isActive,
    } = resolveEffectiveFlatEntity({
      metadataName: 'viewField',
      flatEntity: viewField,
    });

    return [
      {
        ...viewField,
        isVisible,
        size,
        position,
        aggregateOperation,
        viewFieldGroupId,
        isActive,
        viewFieldGroupUniversalIdentifier: isDefined(viewFieldGroupId)
          ? (flatViewFieldGroupMaps.universalIdentifierById[
              viewFieldGroupId
            ] ?? null)
          : null,
        overrides: null,
        universalOverrides: null,
        id: v4(),
        universalIdentifier: v4(),
        fieldMetadataId: head.id,
        fieldMetadataUniversalIdentifier: head.universalIdentifier,
        applicationUniversalIdentifier:
          workspaceCustomApplicationUniversalIdentifier,
      },
    ];
  });
};
