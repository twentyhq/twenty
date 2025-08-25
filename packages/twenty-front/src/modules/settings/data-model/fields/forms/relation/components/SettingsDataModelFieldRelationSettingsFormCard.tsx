import { useFormContext } from 'react-hook-form';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import {
  SettingsDataModelFieldRelationForm,
  type SettingsDataModelFieldRelationFormValues,
} from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationForm';
import { SettingsDataModelFieldRelationPreviewContent } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationPreviewContent';
import { SettingsDataModelRelationPreviewImage } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationPreviewImageCard';
import { SettingsDataModelRelationFieldPreviewSubWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelRelationFieldPreviewSubWidget';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldRelationSettingsFormCardProps = {
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

export const SettingsDataModelFieldRelationSettingsFormCard = ({
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldRelationSettingsFormCardProps) => {
  const { watch } = useFormContext<
    SettingsDataModelFieldRelationFormValues &
      SettingsDataModelFieldEditFormValues
  >();
  const isMobile = useIsMobile();

  const { objectMetadataItems } = useObjectMetadataItems();

  const relationObjectMetadataId = watch('relation.objectMetadataId');
  const relationObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === relationObjectMetadataId,
  );
  const relationTargetField = watch('relation.field');

  const relationType: RelationType = watch('relation.type');
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
                relationType: relationType,
              },
            }}
            shrink
            objectNameSingulars={[objectNameSingular]}
            fieldPreviewTargetObjectNameSingular={
              relationObjectMetadataItem?.nameSingular ?? 'company'
            }
            pluralizeLabel={relationType === RelationType.ONE_TO_MANY}
          />
          <SettingsDataModelRelationPreviewImage
            src={relationTypeConfig?.imageSrc}
            flip={relationTypeConfig?.isImageFlipped}
            alt={relationTypeConfig?.label}
            isMobile={isMobile}
          />
          <SettingsDataModelRelationFieldPreviewSubWidget
            fieldMetadataItem={{
              icon: relationTargetField?.icon,
              label: relationTargetField?.label,
              type: FieldMetadataType.RELATION,
              settings: {
                relationType: oppositeRelationType,
              },
            }}
            shrink
            objectNameSingulars={[
              relationObjectMetadataItem?.nameSingular ?? 'company',
            ]}
            fieldPreviewTargetObjectNameSingular={objectNameSingular}
            pluralizeLabel={oppositeRelationType === RelationType.ONE_TO_MANY}
          />
        </SettingsDataModelFieldRelationPreviewContent>
      }
      form={
        <SettingsDataModelFieldRelationForm
          existingFieldMetadataId={existingFieldMetadataId}
          objectMetadataItem={relationObjectMetadataItem}
        />
      }
    />
  );
};
