import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useIcons } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';

export type SettingsDataModelObjectSummaryProps = {
  className?: string;
  objectMetadataItem: ObjectMetadataItem;
};

const StyledObjectSummary = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
`;

const StyledObjectName = styled.div`
  align-items: center;
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsDataModelObjectSummary = ({
  className,
  objectMetadataItem,
}: SettingsDataModelObjectSummaryProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();
  const ObjectIcon = getIcon(objectMetadataItem.icon);
  const objectTypeLabel = getObjectTypeLabel(objectMetadataItem);

  return (
    <StyledObjectSummary className={className}>
      <StyledObjectName>
        <ObjectIcon size={theme.icon.size.sm} stroke={theme.icon.stroke.md} />
        {objectMetadataItem.labelPlural}
      </StyledObjectName>
      <SettingsDataModelObjectTypeTag objectTypeLabel={objectTypeLabel} />
    </StyledObjectSummary>
  );
};
