import styled from '@emotion/styled';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { SettingsDataModelFieldPreviewCard } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewCard';
import { SettingsDataModelObjectSummary } from '@/settings/data-model/objects/SettingsDataModelObjectSummary';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';

type SettingsDataModelObjectSettingsFormCardProps = {
  objectMetadataItem: ObjectMetadataItem;
};

const StyledFieldPreviewCard = styled(SettingsDataModelFieldPreviewCard)`
  width: 100%;
`;

const StyledObjectSummaryCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  max-width: 480px;
`;

const StyledObjectSummaryCardContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDataModelObjectSettingsFormCard = ({
  objectMetadataItem,
}: SettingsDataModelObjectSettingsFormCardProps) => {
  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  return (
    <SettingsDataModelPreviewFormCard
      preview={
        labelIdentifierFieldMetadataItem ? (
          <StyledFieldPreviewCard
            objectMetadataItem={objectMetadataItem}
            fieldMetadataItem={labelIdentifierFieldMetadataItem}
            withFieldLabel={false}
          />
        ) : (
          <StyledObjectSummaryCard>
            <StyledObjectSummaryCardContent>
              <SettingsDataModelObjectSummary
                objectMetadataItem={objectMetadataItem}
              />
            </StyledObjectSummaryCardContent>
          </StyledObjectSummaryCard>
        )
      }
    />
  );
};
