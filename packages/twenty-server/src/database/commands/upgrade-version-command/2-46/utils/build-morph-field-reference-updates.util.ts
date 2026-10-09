import { v4 } from 'uuid';
import {
  getSystemViewFieldUniversalIdentifier,
  getSystemFormFieldPageLayoutWidgetUniversalIdentifier,
} from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationGroup,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const buildMorphFieldReferenceUpdates = ({
  flatFieldMetadataMaps,
  flatViewFieldMaps,
  flatFieldPermissionMaps,
  flatPageLayoutWidgetMaps,
  direction,
}: Pick<
  AllFlatEntityMaps,
  | 'flatFieldMetadataMaps'
  | 'flatViewFieldMaps'
  | 'flatFieldPermissionMaps'
  | 'flatPageLayoutWidgetMaps'
> & {
  direction: 'up' | 'down';
}): AllFlatEntityOperationByMetadataName => {
  const fields = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const replacementByFieldId = new Map<string, FlatFieldMetadata>();
  const replacementByUniversalIdentifier = new Map<string, FlatFieldMetadata>();

  for (const group of fields.filter(isMorphRelationGroup)) {
    const targets = fields.filter(
      (field) =>
        field.type === FieldMetadataType.MORPH_RELATION &&
        field.morphId === group.morphId &&
        field.id !== group.id,
    );
    if (direction === 'down') {
      if (targets.length === 0) {
        throw new Error(
          `Cannot downgrade morph field ${group.name} without a target`,
        );
      }
      const previousField = pickMorphGroupSurvivorOrThrow(targets);
      replacementByFieldId.set(group.id, previousField);
      replacementByUniversalIdentifier.set(
        group.universalIdentifier,
        previousField,
      );
    } else {
      for (const target of targets) {
        replacementByFieldId.set(target.id, group);
        replacementByUniversalIdentifier.set(target.universalIdentifier, group);
      }
    }
  }

  const operations: Required<
    Pick<
      AllFlatEntityOperationByMetadataName,
      'viewField' | 'fieldPermission' | 'fieldMetadata' | 'pageLayoutWidget'
    >
  > = {
    viewField: {
      flatEntityToCreate: [],
      flatEntityToUpdate: [],
      flatEntityToDelete: [],
    },
    fieldPermission: {
      flatEntityToCreate: [],
      flatEntityToUpdate: [],
      flatEntityToDelete: [],
    },
    fieldMetadata: {
      flatEntityToCreate: [],
      flatEntityToUpdate: [],
      flatEntityToDelete: [],
    },
    pageLayoutWidget: {
      flatEntityToCreate: [],
      flatEntityToUpdate: [],
      flatEntityToDelete: [],
    },
  };

  const viewFields = Object.values(flatViewFieldMaps.byUniversalIdentifier)
    .filter(isDefined)
    .sort(
      (left, right) =>
        left.position - right.position || left.id.localeCompare(right.id),
    );
  const occupiedColumns = new Set(
    viewFields
      .filter((field) => !replacementByFieldId.has(field.fieldMetadataId))
      .map((field) => `${field.viewId}:${field.fieldMetadataId}`),
  );
  for (const viewField of viewFields) {
    const replacement = replacementByFieldId.get(viewField.fieldMetadataId);
    if (!isDefined(replacement)) continue;
    const key = `${viewField.viewId}:${replacement.id}`;
    if (occupiedColumns.has(key)) {
      operations.viewField.flatEntityToDelete.push(viewField);
    } else {
      occupiedColumns.add(key);
      const updatedViewField = {
        ...viewField,
        fieldMetadataUniversalIdentifier: replacement.universalIdentifier,
      };
      if (viewField.isSystemSideEffect) {
        operations.viewField.flatEntityToDelete.push(viewField);
        operations.viewField.flatEntityToCreate.push({
          ...updatedViewField,
          universalIdentifier: getSystemViewFieldUniversalIdentifier({
            fieldMetadataApplicationUniversalIdentifier:
              replacement.applicationUniversalIdentifier,
            fieldMetadataUniversalIdentifier: replacement.universalIdentifier,
            viewUniversalIdentifier: viewField.viewUniversalIdentifier,
          }),
        });
      } else {
        operations.viewField.flatEntityToUpdate.push(updatedViewField);
      }
    }
  }

  const permissionsByRoleAndField = new Map<
    string,
    (typeof operations.fieldPermission.flatEntityToUpdate)[number]
  >();
  const createdPermissionIdentifiers = new Set<string>();
  const permissions = Object.values(
    flatFieldPermissionMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .flatMap((permission) => {
      const group =
        flatFieldMetadataMaps.byUniversalIdentifier[
          permission.fieldMetadataUniversalIdentifier
        ];
      if (
        direction !== 'down' ||
        !isDefined(group) ||
        !isMorphRelationGroup(group)
      )
        return [permission];
      const representative = replacementByFieldId.get(group.id);
      return fields
        .filter(
          (field) => field.morphId === group.morphId && field.id !== group.id,
        )
        .map((target) => {
          const universalIdentifier =
            target.id === representative?.id
              ? permission.universalIdentifier
              : v4();
          if (universalIdentifier !== permission.universalIdentifier)
            createdPermissionIdentifiers.add(universalIdentifier);
          return {
            ...permission,
            id:
              universalIdentifier === permission.universalIdentifier
                ? permission.id
                : v4(),
            universalIdentifier,
            fieldMetadataId: target.id,
            fieldMetadataUniversalIdentifier: target.universalIdentifier,
          };
        });
    });
  for (const permission of permissions) {
    const replacement = replacementByFieldId.get(permission.fieldMetadataId);
    const fieldUniversalIdentifier =
      replacement?.universalIdentifier ??
      permission.fieldMetadataUniversalIdentifier;
    const key = `${permission.roleId}:${fieldUniversalIdentifier}`;
    const existing = permissionsByRoleAndField.get(key);
    if (isDefined(existing)) {
      const retainExisting =
        !createdPermissionIdentifiers.has(existing.universalIdentifier) ||
        createdPermissionIdentifiers.has(permission.universalIdentifier);
      const retained = retainExisting ? existing : permission;
      const discarded = retainExisting ? permission : existing;
      permissionsByRoleAndField.set(key, {
        ...retained,
        fieldMetadataUniversalIdentifier: fieldUniversalIdentifier,
        canReadFieldValue:
          existing.canReadFieldValue === false ||
          permission.canReadFieldValue === false
            ? false
            : null,
        canUpdateFieldValue:
          existing.canUpdateFieldValue === false ||
          permission.canUpdateFieldValue === false
            ? false
            : null,
      });
      if (!createdPermissionIdentifiers.has(discarded.universalIdentifier))
        operations.fieldPermission.flatEntityToDelete.push(discarded);
    } else {
      permissionsByRoleAndField.set(key, {
        ...permission,
        fieldMetadataUniversalIdentifier: fieldUniversalIdentifier,
      });
    }
  }
  for (const permission of permissionsByRoleAndField.values()) {
    if (createdPermissionIdentifiers.has(permission.universalIdentifier)) {
      operations.fieldPermission.flatEntityToCreate.push(permission);
      continue;
    }
    const previous =
      flatFieldPermissionMaps.byUniversalIdentifier[
        permission.universalIdentifier
      ];
    if (
      previous?.fieldMetadataUniversalIdentifier !==
        permission.fieldMetadataUniversalIdentifier ||
      previous?.canReadFieldValue !== permission.canReadFieldValue ||
      previous?.canUpdateFieldValue !== permission.canUpdateFieldValue
    )
      operations.fieldPermission.flatEntityToUpdate.push(permission);
  }

  for (const field of fields) {
    const settings = field.universalSettings;
    if (
      !isDefined(settings) ||
      !('junctionTargetFieldUniversalIdentifier' in settings) ||
      !isDefined(settings.junctionTargetFieldUniversalIdentifier)
    )
      continue;
    const replacement = replacementByUniversalIdentifier.get(
      settings.junctionTargetFieldUniversalIdentifier,
    );
    if (isDefined(replacement)) {
      operations.fieldMetadata.flatEntityToUpdate.push({
        ...field,
        universalSettings: {
          ...settings,
          junctionTargetFieldUniversalIdentifier:
            replacement.universalIdentifier,
        },
      });
    }
  }

  const widgets = Object.values(
    flatPageLayoutWidgetMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const occupiedFormFields = new Set(
    widgets.flatMap((widget) => {
      const configuration = widget.universalConfiguration;
      return configuration?.configurationType ===
        WidgetConfigurationType.FORM_FIELD &&
        !replacementByUniversalIdentifier.has(configuration.fieldMetadataId)
        ? [
            `${widget.pageLayoutTabUniversalIdentifier}:${configuration.fieldMetadataId}`,
          ]
        : [];
    }),
  );
  for (const widget of widgets) {
    const configuration = widget.universalConfiguration;
    if (
      !isDefined(configuration) ||
      (configuration.configurationType !== WidgetConfigurationType.FIELD &&
        configuration.configurationType !== WidgetConfigurationType.FORM_FIELD)
    )
      continue;
    const replacement = replacementByUniversalIdentifier.get(
      configuration.fieldMetadataId,
    );
    if (
      isDefined(replacement) &&
      configuration.configurationType === WidgetConfigurationType.FORM_FIELD
    ) {
      const key = `${widget.pageLayoutTabUniversalIdentifier}:${replacement.universalIdentifier}`;
      if (occupiedFormFields.has(key)) {
        operations.pageLayoutWidget.flatEntityToDelete.push(widget);
        continue;
      }
      occupiedFormFields.add(key);
      if (widget.isSystemSideEffect) {
        operations.pageLayoutWidget.flatEntityToDelete.push(widget);
        operations.pageLayoutWidget.flatEntityToCreate.push({
          ...widget,
          universalIdentifier:
            getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
              fieldMetadataApplicationUniversalIdentifier:
                replacement.applicationUniversalIdentifier,
              pageLayoutTabUniversalIdentifier:
                widget.pageLayoutTabUniversalIdentifier,
              fieldMetadataUniversalIdentifier: replacement.universalIdentifier,
            }),
          universalConfiguration: {
            ...configuration,
            fieldMetadataId: replacement.universalIdentifier,
          },
        });
        continue;
      }
    }
    const nestedReplacement =
      configuration.configurationType === WidgetConfigurationType.FIELD &&
      isDefined(configuration.nestedRelationFieldMetadataId)
        ? replacementByUniversalIdentifier.get(
            configuration.nestedRelationFieldMetadataId,
          )
        : undefined;
    if (isDefined(replacement) || isDefined(nestedReplacement)) {
      operations.pageLayoutWidget.flatEntityToUpdate.push({
        ...widget,
        universalConfiguration: {
          ...configuration,
          ...(isDefined(replacement) && {
            fieldMetadataId: replacement.universalIdentifier,
          }),
          ...(isDefined(nestedReplacement) && {
            nestedRelationFieldMetadataId:
              nestedReplacement.universalIdentifier,
          }),
        },
      });
    }
  }

  return operations;
};
