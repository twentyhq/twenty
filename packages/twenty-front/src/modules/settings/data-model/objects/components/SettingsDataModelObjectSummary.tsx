import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { OverflowingTextWithTooltip, useIcons } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/components/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';

export type SettingsDataModelObjectSummaryProps = {
  className?: string;
  objectMetadataItem: ObjectMetadataItem;
  pluralizeLabel?: boolean;
};

const StyledObjectSummary = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledObjectName = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 60%;
`;

const StyledIconContainer = styled.div`
  flex-shrink: 0;
`;

export const SettingsDataModelObjectSummary = ({
  className,
  objectMetadataItem,
  pluralizeLabel = true,
}: SettingsDataModelObjectSummaryProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();
  const ObjectIcon = getIcon(objectMetadataItem.icon);
  const objectTypeLabel = getObjectTypeLabel(objectMetadataItem);

  return (
    <StyledObjectSummary className={className}>
      <StyledObjectName>
        <StyledIconContainer>
          <ObjectIcon size={theme.icon.size.sm} stroke={theme.icon.stroke.md} />
        </StyledIconContainer>
        <OverflowingTextWithTooltip
          text={
            pluralizeLabel
              ? objectMetadataItem.labelPlural
              : objectMetadataItem.labelSingular
          }
        />
      </StyledObjectName>
      <SettingsDataModelObjectTypeTag objectTypeLabel={objectTypeLabel} />
    </StyledObjectSummary>
  );
};
