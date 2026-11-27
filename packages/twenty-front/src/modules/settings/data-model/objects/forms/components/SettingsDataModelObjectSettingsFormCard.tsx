import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { SettingsPreviewCard } from '@/settings/components/SettingsPreviewCard';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { SettingsDataModelPreviewMiniCard } from '@/settings/data-model/components/SettingsDataModelPreviewMiniCard';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { SettingsDataModelObjectIdentifiersForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectIdentifiersForm';
import { Card } from 'twenty-ui/primitives/surfaces';

type SettingsDataModelObjectSettingsFormCardProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

const StyledObjectSummaryCardContainer = styled.div`
  max-width: 480px;
`;

export const SettingsDataModelObjectSettingsFormCard = ({
  objectMetadataItem,
}: SettingsDataModelObjectSettingsFormCardProps) => {
  const labelIdentifierFieldMetadataItem = useMemo(() => {
    return getLabelIdentifierFieldMetadataItem({
      fields: objectMetadataItem.fields,
      labelIdentifierFieldMetadataId:
        objectMetadataItem.labelIdentifierFieldMetadataId,
    });
  }, [objectMetadataItem]);

  return (
    <SettingsPreviewCard
      preview={
        labelIdentifierFieldMetadataItem ? (
          <SettingsDataModelFieldPreviewWidget
            objectNameSingular={objectMetadataItem.nameSingular}
            fieldMetadataItem={labelIdentifierFieldMetadataItem}
            withFieldLabel={false}
          />
        ) : (
          <StyledObjectSummaryCardContainer>
            <SettingsDataModelPreviewMiniCard>
              <SettingsDataModelObjectPreview
                objectMetadataItems={[objectMetadataItem]}
              />
            </SettingsDataModelPreviewMiniCard>
          </StyledObjectSummaryCardContainer>
        )
      }
      content={
        <Card.Content>
          <SettingsDataModelObjectIdentifiersForm
            objectMetadataItem={objectMetadataItem}
          />
        </Card.Content>
      }
    />
  );
};
