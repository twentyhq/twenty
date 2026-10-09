import { getSystemFormFieldPageLayoutWidgetUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const buildMorphWidgetReferenceUpdates = ({
  flatPageLayoutWidgetMaps,
  replacementByUniversalIdentifier,
}: Pick<AllFlatEntityMaps, 'flatPageLayoutWidgetMaps'> & {
  replacementByUniversalIdentifier: Map<string, FlatFieldMetadata>;
}): NonNullable<AllFlatEntityOperationByMetadataName['pageLayoutWidget']> => {
  const operations: NonNullable<
    AllFlatEntityOperationByMetadataName['pageLayoutWidget']
  > = {
    flatEntityToCreate: [],
    flatEntityToUpdate: [],
    flatEntityToDelete: [],
  };

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
        operations.flatEntityToDelete.push(widget);
        continue;
      }
      occupiedFormFields.add(key);
      if (widget.isSystemSideEffect) {
        operations.flatEntityToDelete.push(widget);
        operations.flatEntityToCreate.push({
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
      operations.flatEntityToUpdate.push({
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
