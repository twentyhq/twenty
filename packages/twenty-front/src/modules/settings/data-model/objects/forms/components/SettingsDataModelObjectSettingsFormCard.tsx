import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { SettingsDataModelCardTitle } from '@/settings/data-model/components/SettingsDataModelCardTitle';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { SettingsDataModelObjectIdentifiersForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectIdentifiersForm';
import { Trans } from '@lingui/react/macro';
import { Card, CardContent } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsDataModelObjectSettingsFormCardProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

const StyledTopCardContentContainer = styled.div`
  > * {
    background-color: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledObjectSummaryCardContainer = styled.div`
  max-width: 480px;

  > * {
    border-radius: ${themeCssVariables.border.radius.md};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledObjectSummaryCardContentContainer = styled.div`
  > * {
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
    <Card fullWidth>
      <StyledTopCardContentContainer>
        <CardContent divider>
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
              <Card>
                <StyledObjectSummaryCardContentContainer>
                  <CardContent>
                    <SettingsDataModelObjectPreview
                      objectMetadataItems={[objectMetadataItem]}
                    />
                  </CardContent>
                </StyledObjectSummaryCardContentContainer>
              </Card>
            </StyledObjectSummaryCardContainer>
          )}
        </CardContent>
      </StyledTopCardContentContainer>
      <CardContent>
        <SettingsDataModelObjectIdentifiersForm
          objectMetadataItem={objectMetadataItem}
        />
      </CardContent>
    </Card>
  );
};
