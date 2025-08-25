import styled from '@emotion/styled';
import { useMemo } from 'react';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { SettingsDataModelCardTitle } from '@/settings/data-model/components/SettingsDataModelCardTitle';
import { SettingsDataModelFieldPreviewWidget } from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreviewWidget';
import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { SettingsDataModelObjectIdentifiersForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectIdentifiersForm';
import { Trans } from '@lingui/react/macro';
import { Card, CardContent } from 'twenty-ui/layout';

type SettingsDataModelObjectSettingsFormCardProps = {
  objectMetadataItem: ObjectMetadataItem;
};

const StyledTopCardContent = styled(CardContent)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
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
  const labelIdentifierFieldMetadataItem = useMemo(() => {
    return getLabelIdentifierFieldMetadataItem({
      fields: objectMetadataItem.fields,
      labelIdentifierFieldMetadataId:
        objectMetadataItem.labelIdentifierFieldMetadataId,
    });
  }, [objectMetadataItem]);

  return (
    <Card fullWidth>
      <StyledTopCardContent divider>
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
          <StyledObjectSummaryCard>
            <StyledObjectSummaryCardContent>
              <SettingsDataModelObjectPreview
                objectMetadataItems={[objectMetadataItem]}
              />
            </StyledObjectSummaryCardContent>
          </StyledObjectSummaryCard>
        )}
      </StyledTopCardContent>
      <CardContent>
        <SettingsDataModelObjectIdentifiersForm
          objectMetadataItem={objectMetadataItem}
        />
      </CardContent>
    </Card>
  );
};
