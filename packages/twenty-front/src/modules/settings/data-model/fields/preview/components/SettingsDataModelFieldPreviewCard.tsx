import styled from '@emotion/styled';
import { Card, CardContent } from 'twenty-ui';

import {
  SettingsDataModelFieldPreview,
  SettingsDataModelFieldPreviewProps,
} from '@/settings/data-model/fields/preview/components/SettingsDataModelFieldPreview';
import { SettingsDataModelObjectSummary } from '@/settings/data-model/objects/SettingsDataModelObjectSummary';

export type SettingsDataModelFieldPreviewCardProps =
  SettingsDataModelFieldPreviewProps & {
    className?: string;
  };

const StyledCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledCardContent = styled(CardContent)`
  display: grid;
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDataModelFieldPreviewCard = ({
  className,
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataItem,
  selectOptions,
  shrink,
  withFieldLabel = true,
}: SettingsDataModelFieldPreviewCardProps) => (
  <StyledCard className={className} fullWidth>
    <StyledCardContent>
      <SettingsDataModelObjectSummary objectMetadataItem={objectMetadataItem} />
      <SettingsDataModelFieldPreview
        objectMetadataItem={objectMetadataItem}
        fieldMetadataItem={fieldMetadataItem}
        relationObjectMetadataItem={relationObjectMetadataItem}
        selectOptions={selectOptions}
        shrink={shrink}
        withFieldLabel={withFieldLabel}
      />
    </StyledCardContent>
  </StyledCard>
);
