import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import {
  SettingsDataModelFieldMorphRelationForm,
  type SettingsDataModelFieldMorphRelationFormValues,
} from '@/settings/data-model/fields/forms/morph-relation/components/SettingsDataModelFieldMorphRelationForm';
import { useMorphRelationSettingsFormInitialValues } from '@/settings/data-model/fields/forms/morph-relation/hooks/useMorphRelationSettingsFormInitialValues';
import {
  StyledFieldPreviewCard,
  StyledPreviewContent,
  StyledRelationImage,
} from '@/settings/data-model/fields/forms/relation/components/SettingsDataModelFieldRelationSettingsFormCard';
import { type SettingsDataModelFieldPreviewCardProps } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { SettingsDataModelMorphRelationFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelMorphRelationFieldPreviewCard';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { isDefined } from 'twenty-shared/utils';
import {
  FieldMetadataType,
  RelationType,
  type Relation,
} from '~/generated-metadata/graphql';

// todo @guillim : this is a copy of the relation settings form card, we need to refactor it to be more morphspecific
type SettingsDataModelFieldMorphRelationSettingsFormCardProps = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'icon' | 'label' | 'type'> &
    Partial<Omit<FieldMetadataItem, 'icon' | 'label' | 'type'>>;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledMorphRelationFieldPreviewCard = styled(
  SettingsDataModelMorphRelationFieldPreviewCard,
)`
  flex: 1 1 100%;
`;

export const SettingsDataModelFieldMorphRelationSettingsFormCard = ({
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldMorphRelationSettingsFormCardProps) => {
  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldMorphRelationFormValues>();
  const { findObjectMetadataItemById } = useFilteredObjectMetadataItems();
  const isMobile = useIsMobile();
  const { initialRelationObjectMetadataItems, initialRelationType } =
    useMorphRelationSettingsFormInitialValues({
      fieldMetadataItem,
    });

  const initialRelationFieldMetadataItem = {
    icon: initialRelationObjectMetadataItems[0].icon ?? 'IconUsers',
    label: [RelationType.MANY_TO_ONE].includes(initialRelationType)
      ? initialRelationObjectMetadataItems[0].labelPlural
      : initialRelationObjectMetadataItems[0].labelSingular,
  };
  const initialRelationObjectMetadataItem =
    initialRelationObjectMetadataItems[0];

  const relationObjectMetadataId = watchFormValue(
    'morphRelationObjectMetadataIds.0',
    initialRelationObjectMetadataItem?.id,
  );
  const relationObjectMetadataItem = findObjectMetadataItemById(
    relationObjectMetadataId,
  );

  if (!relationObjectMetadataItem) return null;

  const relationType: RelationType = watchFormValue(
    'relationType',
    initialRelationType,
  );

  const relationTypeConfig = RELATION_TYPES[relationType];

  if (!isDefined(relationTypeConfig)) return null;

  const oppositeRelationType =
    relationType === RelationType.MANY_TO_ONE
      ? RelationType.ONE_TO_MANY
      : RelationType.MANY_TO_ONE;

  const morphRelationsForStyledFieldPreviewCard = watchFormValue(
    'morphRelationObjectMetadataIds',
  )?.map((morphRelationObjectMetadataId) => {
    const relationObjectMetadataItem = findObjectMetadataItemById(
      morphRelationObjectMetadataId,
    );
    if (!relationObjectMetadataItem)
      throw new Error('Relation object metadata item not found');
    return {
      targetObjectMetadata: {
        id: relationObjectMetadataItem.id,
        nameSingular: relationObjectMetadataItem.labelSingular,
        labelSingular: relationObjectMetadataItem.labelSingular,
        labelPlural: relationObjectMetadataItem.labelPlural,
        icon: relationObjectMetadataItem.icon,
        isCustom: relationObjectMetadataItem.isCustom,
        isRemote: relationObjectMetadataItem.isRemote,
      },
    };
  });

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledPreviewContent isMobile={isMobile}>
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
              watchFormValue('relationType') === RelationType.MANY_TO_ONE
            }
          />
          <StyledRelationImage
            src={relationTypeConfig.imageSrc}
            flip={relationTypeConfig.isImageFlipped}
            alt={relationTypeConfig.label}
            isMobile={isMobile}
          />
          {morphRelationsForStyledFieldPreviewCard && (
            <StyledMorphRelationFieldPreviewCard
              fieldMetadataItem={{
                ...initialRelationFieldMetadataItem,
                icon: watchFormValue(
                  'iconOnDestination',
                  initialRelationFieldMetadataItem.icon,
                ),
                label:
                  watchFormValue(
                    'targetFieldLabel',
                    initialRelationFieldMetadataItem.label,
                  ) || 'Field name',
                type: FieldMetadataType.RELATION,
                relation: {
                  type: oppositeRelationType,
                } as Relation,
                morphRelations: morphRelationsForStyledFieldPreviewCard,
              }}
              shrink
              objectMetadataItem={relationObjectMetadataItem}
              relationObjectMetadataItem={objectMetadataItem}
              pluralizeLabel={
                watchFormValue('relationType') !== RelationType.MANY_TO_ONE
              }
            />
          )}
        </StyledPreviewContent>
      }
      form={
        <SettingsDataModelFieldMorphRelationForm
          fieldMetadataItem={fieldMetadataItem}
        />
      }
    />
  );
};
