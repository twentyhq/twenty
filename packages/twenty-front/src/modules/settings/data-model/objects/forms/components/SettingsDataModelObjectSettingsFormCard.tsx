import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { SettingsDataModelCardTitle } from '@/settings/data-model/components/SettingsDataModelCardTitle';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { SettingsDataModelObjectIdentifiersForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectIdentifiersForm';
import { Trans } from '@lingui/react/macro';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsDataModelObjectSettingsFormCardProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

const StyledTopCardContentContainer = styled.div`
  > div {
    background-color: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledObjectSummaryCardContainer = styled.div`
  max-width: 480px;

  > div {
    border-radius: ${themeCssVariables.border.radius.md};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledObjectSummaryCardContentContainer = styled.div`
  > div {
    padding: ${themeCssVariables.spacing[2]};
  }
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
    <Card.Root fullWidth>
      <StyledTopCardContentContainer>
        <Card.Content divider>
          <SettingsDataModelCardTitle>
            <Trans>Preview</Trans>
          </SettingsDataModelCardTitle>
          {labelIdentifierFieldMetadataItem ? (
            <SettingsDataModelFieldPreviewWidget
              objectNameSingular={objectMetadataItem.nameSingular}
              fieldMetadataItem={labelIdentifierFieldMetadataItem}
              withFieldLabel={false}
            />
          ) : (
            <StyledObjectSummaryCardContainer>
              <Card.Root>
                <StyledObjectSummaryCardContentContainer>
                  <Card.Content>
                    <SettingsDataModelObjectPreview
                      objectMetadataItems={[objectMetadataItem]}
                    />
                  </Card.Content>
                </StyledObjectSummaryCardContentContainer>
              </Card.Root>
            </StyledObjectSummaryCardContainer>
          )}
        </Card.Content>
      </StyledTopCardContentContainer>
      <Card.Content>
        <SettingsDataModelObjectIdentifiersForm
          objectMetadataItem={objectMetadataItem}
        />
      </Card.Content>
    </Card.Root>
  );
};
