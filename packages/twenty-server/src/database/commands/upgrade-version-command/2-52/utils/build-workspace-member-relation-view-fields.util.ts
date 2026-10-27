import {
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  getSystemViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const buildWorkspaceMemberRelationViewFields = ({
  flatFieldMetadataMaps,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
  standardViewFields,
  standardRelationsGroup,
  fieldsWidget,
  now,
}: Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatViewFieldMaps' | 'flatViewFieldGroupMaps'
> & {
  standardViewFields: FlatViewField[];
  standardRelationsGroup: FlatViewFieldGroup;
  fieldsWidget: FlatPageLayoutWidget;
  now: string;
}): UniversalFlatViewField[] => {
  const fieldsView =
    STANDARD_OBJECTS.workspaceMember.views.workspaceMemberRecordPageFields;
  const relationsGroup =
    flatViewFieldGroupMaps.byUniversalIdentifier[
      standardRelationsGroup.universalIdentifier
    ] ?? standardRelationsGroup;

  if (
    isDefined(relationsGroup.deletedAt) ||
    !resolveEffectiveFlatEntityProperty({
      metadataName: 'viewFieldGroup',
      flatEntity: relationsGroup,
      property: 'isActive',
    }) ||
    isDefined(fieldsWidget.deletedAt) ||
    !resolveEffectiveUniversalFlatEntityProperty({
      metadataName: 'pageLayoutWidget',
      universalFlatEntity: fieldsWidget,
      property: 'isActive',
    })
  ) {
    return [];
  }

  const configuration = resolveEffectiveUniversalFlatEntityProperty({
    metadataName: 'pageLayoutWidget',
    universalFlatEntity: fieldsWidget,
    property: 'universalConfiguration',
  });
  if (
    configuration?.configurationType !== WidgetConfigurationType.FIELDS ||
    configuration.viewUniversalIdentifier !== fieldsView.universalIdentifier ||
    !isDefined(configuration.newFieldDefaultVisibility)
  ) {
    return [];
  }

  const { newFieldDefaultVisibility } = configuration;

  const existingViewFields = Object.values(
    flatViewFieldMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (viewField) =>
        viewField.viewUniversalIdentifier === fieldsView.universalIdentifier,
    );
  const existingFieldIdentifiers = new Set(
    existingViewFields.map(
      (viewField) => viewField.fieldMetadataUniversalIdentifier,
    ),
  );
  let position =
    [...existingViewFields, ...standardViewFields]
      .filter((viewField) => !isDefined(viewField.deletedAt))
      .filter(
        (viewField) =>
          resolveEffectiveUniversalFlatEntityProperty({
            metadataName: 'viewField',
            universalFlatEntity: viewField,
            property: 'viewFieldGroupUniversalIdentifier',
          }) === relationsGroup.universalIdentifier,
      )
      .reduce(
        (maximumPosition, viewField) =>
          Math.max(
            maximumPosition,
            resolveEffectiveUniversalFlatEntityProperty({
              metadataName: 'viewField',
              universalFlatEntity: viewField,
              property: 'position',
            }),
          ),
        -1,
      ) + 1;

  return Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (field) =>
        field.objectMetadataUniversalIdentifier ===
          STANDARD_OBJECTS.workspaceMember.universalIdentifier &&
        field.applicationUniversalIdentifier !==
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER &&
        (field.type === FieldMetadataType.RELATION ||
          field.type === FieldMetadataType.MORPH_RELATION) &&
        resolveEffectiveUniversalFlatEntityProperty({
          metadataName: 'fieldMetadata',
          universalFlatEntity: field,
          property: 'isActive',
        }) &&
        !existingFieldIdentifiers.has(field.universalIdentifier),
    )
    .sort((firstField, secondField) =>
      firstField.name.localeCompare(secondField.name),
    )
    .flatMap((field) => {
      const universalIdentifier = getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          field.applicationUniversalIdentifier,
        viewUniversalIdentifier: fieldsView.universalIdentifier,
        fieldMetadataUniversalIdentifier: field.universalIdentifier,
      });
      if (
        isDefined(flatViewFieldMaps.byUniversalIdentifier[universalIdentifier])
      ) {
        return [];
      }
      return [
        {
          universalIdentifier,
          applicationUniversalIdentifier: field.applicationUniversalIdentifier,
          fieldMetadataUniversalIdentifier: field.universalIdentifier,
          viewUniversalIdentifier: fieldsView.universalIdentifier,
          viewFieldGroupUniversalIdentifier: relationsGroup.universalIdentifier,
          isVisible: newFieldDefaultVisibility,
          size: DEFAULT_VIEW_FIELD_SIZE,
          position: position++,
          aggregateOperation: null,
          isActive: true,
          isSystemSideEffect: true,
          universalOverrides: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      ];
    });
};
