import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import {
  SettingsDataModelFieldMorphRelationForm,
  type SettingsDataModelFieldMorphRelationFormValues,
} from '@/settings/data-model/fields/forms/morphRelation/components/SettingsDataModelFieldMorphRelationForm';
import { useMorphRelationSettingsFormInitialValues } from '@/settings/data-model/fields/forms/morphRelation/hooks/useMorphRelationSettingsFormInitialValues';
import {
  SettingsDataModelFieldPreviewCard,
  type SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
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
  relationFieldMetadataItem?: FieldMetadataItem;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  flex: 1 1 100%;
`;

const StyledPreviewContent = styled.div<{ isMobile: boolean }>`
  display: flex;
  gap: 6px;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
`;

const StyledRelationImage = styled.img<{ flip?: boolean; isMobile: boolean }>`
  transform: ${({ flip, isMobile }) => {
    let transform = '';
    if (isMobile) {
      transform += 'rotate(90deg) ';
    }
    if (flip === true) {
      transform += 'scaleX(-1)';
    }
    return transform.trim();
  }};
  margin: auto;
  width: 54px;
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
      objectMetadataItem,
    });

  // todo tmp @guillim remove this when ready
  const initialRelationFieldMetadataItem = {
    icon: initialRelationObjectMetadataItems[0].icon ?? 'IconUsers',
    label: [RelationType.MANY_TO_ONE].includes(initialRelationType)
      ? initialRelationObjectMetadataItems[0].labelPlural
      : initialRelationObjectMetadataItems[0].labelSingular,
  };
  const initialRelationObjectMetadataItem =
    initialRelationObjectMetadataItems[0];

  const relationObjectMetadataId = watchFormValue(
    'morphRelations.0.objectMetadataId',
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
          <StyledFieldPreviewCard
            fieldMetadataItem={{
              ...initialRelationFieldMetadataItem,
              icon: watchFormValue(
                'iconOnDestination',
                initialRelationFieldMetadataItem.icon,
              ),
              label:
                watchFormValue(
                  'fieldOnDestination',
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
              watchFormValue('relationType') !== RelationType.MANY_TO_ONE
            }
          />
        </StyledPreviewContent>
      }
      form={
        <SettingsDataModelFieldMorphRelationForm
          fieldMetadataItem={fieldMetadataItem}
          objectMetadataItem={objectMetadataItem}
        />
      }
    />
  );
};
