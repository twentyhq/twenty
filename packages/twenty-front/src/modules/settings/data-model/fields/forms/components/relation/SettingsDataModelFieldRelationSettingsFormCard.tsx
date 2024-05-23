import { useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';

import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import {
  SettingsDataModelFieldRelationForm,
  SettingsDataModelFieldRelationFormValues,
} from '@/settings/data-model/fields/forms/components/relation/SettingsDataModelFieldRelationForm';
import { useRelationSettingsFormInitialValues } from '@/settings/data-model/fields/forms/hooks/useRelationSettingsFormInitialValues';
import {
  SettingsDataModelFieldPreviewCard,
  SettingsDataModelFieldPreviewCardProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type SettingsDataModelFieldRelationSettingsFormCardProps = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'icon' | 'label' | 'type'> &
    Partial<Omit<FieldMetadataItem, 'icon' | 'label' | 'type'>>;
  relationFieldMetadataItem?: FieldMetadataItem;
} & Pick<SettingsDataModelFieldPreviewCardProps, 'objectMetadataItem'>;

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  display: grid;
  flex: 1 1 100%;
`;

const StyledPreviewContent = styled.div`
  display: flex;
  gap: 6px;
`;

const StyledRelationImage = styled.img<{ flip?: boolean }>`
  transform: ${({ flip }) => (flip ? 'scaleX(-1)' : 'none')};
  width: 54px;
`;

export const SettingsDataModelFieldRelationSettingsFormCard = ({
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsDataModelFieldRelationSettingsFormCardProps) => {
  const { watch: watchFormValue } =
    useFormContext<SettingsDataModelFieldRelationFormValues>();
  const { findObjectMetadataItemById } = useFilteredObjectMetadataItems();

  const {
    initialRelationObjectMetadataItem,
    initialRelationType,
    initialRelationFieldMetadataItem,
  } = useRelationSettingsFormInitialValues({ fieldMetadataItem });

  const relationObjectMetadataId = watchFormValue(
    'relation.objectMetadataId',
    initialRelationObjectMetadataItem?.id,
  );
  const relationObjectMetadataItem = findObjectMetadataItemById(
    relationObjectMetadataId,
  );

  if (!relationObjectMetadataItem) return null;

  const relationType = watchFormValue('relation.type', initialRelationType);
  const relationTypeConfig = RELATION_TYPES[relationType];

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        <StyledPreviewContent>
          <StyledFieldPreviewCard
            fieldMetadataItem={fieldMetadataItem}
            shrink
            objectMetadataItem={objectMetadataItem}
            relationObjectMetadataItem={relationObjectMetadataItem}
          />
          <StyledRelationImage
            src={relationTypeConfig.imageSrc}
            flip={relationTypeConfig.isImageFlipped}
            alt={relationTypeConfig.label}
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
              type: FieldMetadataType.Relation,
            }}
            shrink
            objectMetadataItem={relationObjectMetadataItem}
            relationObjectMetadataItem={objectMetadataItem}
          />
        </StyledPreviewContent>
      }
      form={
        <SettingsDataModelFieldRelationForm
          fieldMetadataItem={fieldMetadataItem}
        />
      }
    />
  );
};
