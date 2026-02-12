import { useFormContext } from 'react-hook-form';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import {
  SettingsDataModelFieldRelationForm,
  type SettingsDataModelFieldMorphRelationFormValues,
} from '@/settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldRelationForm';
import { SettingsDataModelFieldRelationJunctionForm } from '@/settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldRelationJunctionForm';
import { SettingsDataModelFieldRelationPreviewContent } from '@/settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldRelationPreviewContent';
import { SettingsDataModelRelationPreviewImage } from '@/settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldRelationPreviewImageCard';
import { SettingsDataModelRelationFieldPreviewSubWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelRelationFieldPreviewSubWidget';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared/utils';
import {
  FieldMetadataType,
  RelationType,
  FeatureFlagKey,
} from '~/generated-metadata/graphql';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldRelationFormCardProps = {
  existingFieldMetadataId: string;
  objectNameSingular: string;
  disabled?: boolean;
};

export const SettingsDataModelFieldRelationFormCard = ({
  existingFieldMetadataId,
  objectNameSingular,
  disabled = false,
}: SettingsDataModelFieldRelationFormCardProps) => {
  const { watch } = useFormContext<
    SettingsDataModelFieldMorphRelationFormValues &
      SettingsDataModelFieldEditFormValues
  >();
  const isMobile = useIsMobile();
  const isJunctionRelationsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_JUNCTION_RELATIONS_ENABLED,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const sourceObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  if (!sourceObjectMetadataItem) {
    throw new Error('Object not found.');
  }

  const relationObjectMetadataIds: string[] = watch(
    'morphRelationObjectMetadataIds',
    [],
  );

  const relationObjectMetadataItems = relationObjectMetadataIds
    .map((relationObjectMetadataId) =>
      objectMetadataItems.find((item) => item.id === relationObjectMetadataId),
    )
    .filter(isDefined);

  const fallbackRelationObjectMetadataItem = objectMetadataItems[0];

  const relationType: RelationType = watch(
    'relationType',
    RelationType.ONE_TO_MANY,
  );

  const relationTypeConfig = RELATION_TYPES[relationType];

  const oppositeRelationType =
    relationType === RelationType.MANY_TO_ONE
      ? RelationType.ONE_TO_MANY
      : RelationType.MANY_TO_ONE;

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <SettingsDataModelFieldRelationPreviewContent isMobile={isMobile}>
          <SettingsDataModelRelationFieldPreviewSubWidget
            fieldMetadataItem={{
              icon: watch('icon'),
              label: watch('label'),
              type: FieldMetadataType.RELATION,
              settings: {
                relationType,
                joinColumnName: 'previewJoinColumnId',
              },
            }}
            shrink
            objectNameSingulars={[objectNameSingular]}
            fieldPreviewTargetObjectNameSingular={
              relationObjectMetadataItems[0]?.nameSingular ??
              fallbackRelationObjectMetadataItem.nameSingular
            }
            pluralizeLabel={watch('relationType') === RelationType.MANY_TO_ONE}
          />
          <SettingsDataModelRelationPreviewImage
            src={relationTypeConfig.imageSrc}
            flip={relationTypeConfig.isImageFlipped}
            alt={relationTypeConfig.label}
            isMobile={isMobile}
          />
          <SettingsDataModelRelationFieldPreviewSubWidget
            fieldMetadataItem={{
              icon: watch('iconOnDestination'),
              label: watch('targetFieldLabel'),
              type: FieldMetadataType.RELATION,
              settings: {
                relationType: oppositeRelationType,
                joinColumnName: 'previewJoinColumnId',
              },
            }}
            shrink
            objectNameSingulars={
              relationObjectMetadataItems.length > 0
                ? relationObjectMetadataItems.map((item) => item.nameSingular)
                : [fallbackRelationObjectMetadataItem.nameSingular]
            }
            fieldPreviewTargetObjectNameSingular={objectNameSingular}
            pluralizeLabel={watch('relationType') !== RelationType.MANY_TO_ONE}
          />
        </SettingsDataModelFieldRelationPreviewContent>
      }
      form={
        <>
          <SettingsDataModelFieldRelationForm
            existingFieldMetadataId={existingFieldMetadataId}
            sourceObjectMetadataId={sourceObjectMetadataItem?.id}
            disabled={disabled}
          />
          {isJunctionRelationsEnabled && (
            <SettingsDataModelFieldRelationJunctionForm
              objectNameSingular={objectNameSingular}
            />
          )}
        </>
      }
    />
  );
};
