import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import {
  SettingsDataModelFieldRelationForm,
  type SettingsDataModelFieldRelationFormValues,
} from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationForm';
import { SettingsDataModelFieldRelationPreviewContent } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationPreviewContent';
import { SettingsDataModelRelationPreviewImage } from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationPreviewImageCard';
import { useRelationSettingsFormInitialValues } from '@/settings/data-model/fields/forms/relation/hooks/useRelationSettingsFormInitialValues';
import {
  SettingsDataModelFieldPreviewCard,
  type SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import {
  FieldMetadataType,
  type Relation,
  RelationType,
} from '~/generated-metadata/graphql';
type SettingsDataModelFieldRelationSettingsFormCardProps = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'icon' | 'label' | 'type'> &
    Partial<Omit<FieldMetadataItem, 'icon' | 'label' | 'type'>>;
  relationFieldMetadataItem?: FieldMetadataItem;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldRelationSettingsFormCard = ({
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldRelationSettingsFormCardProps) => {
  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldRelationFormValues>();
  const { findObjectMetadataItemById } = useFilteredObjectMetadataItems();
  const isMobile = useIsMobile();
  const {
    initialRelationObjectMetadataItem,
    initialRelationType,
    initialRelationFieldMetadataItem,
  } = useRelationSettingsFormInitialValues({
    fieldMetadataItem,
    objectMetadataItem,
  });

  const relationObjectMetadataId = watchFormValue(
    'relation.objectMetadataId',
    initialRelationObjectMetadataItem?.id,
  );
  const relationObjectMetadataItem = findObjectMetadataItemById(
    relationObjectMetadataId,
  );

  if (!relationObjectMetadataItem) return null;

  const relationType: RelationType = watchFormValue(
    'relation.type',
    initialRelationType,
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
          <StyledFieldPreviewCard
            fieldMetadataItem={{
              ...fieldMetadataItem,
              relation: {
                type: relationType,
              } as Relation,
            }}
            shrink
            objectMetadataItem={objectMetadataItem}
            relationObjectMetadataItem={relationObjectMetadataItem}
            pluralizeLabel={
              watchFormValue('relation.type') === RelationType.MANY_TO_ONE
            }
          />
          <SettingsDataModelRelationPreviewImage
            src={relationTypeConfig.imageSrc}
            flip={relationTypeConfig.isImageFlipped}
            alt={relationTypeConfig.label}
            isMobile={isMobile}
          />
          <StyledFieldPreviewCard
            fieldMetadataItem={{
              ...initialRelationFieldMetadataItem,
              icon: watchFormValue(
                'relation.field.icon',
                initialRelationFieldMetadataItem.icon,
              ),
              label:
                watchFormValue(
                  'relation.field.label',
                  initialRelationFieldMetadataItem.label,
                ) || 'Field name',
              type: FieldMetadataType.RELATION,
              relation: {
                type: oppositeRelationType,
              } as Relation,
            }}
            shrink
            objectMetadataItem={relationObjectMetadataItem}
            relationObjectMetadataItem={objectMetadataItem}
            pluralizeLabel={
              watchFormValue('relation.type') !== RelationType.MANY_TO_ONE
            }
          />
        </SettingsDataModelFieldRelationPreviewContent>
      }
      form={
        <SettingsDataModelFieldRelationForm
          fieldMetadataItem={fieldMetadataItem}
          objectMetadataItem={objectMetadataItem}
        />
      }
    />
  );
};
