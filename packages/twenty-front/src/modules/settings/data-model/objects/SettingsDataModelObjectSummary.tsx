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

const StyledEllipsisParagraph = styled.p`
  max-width: 80px;      
  white-space: nowrap;  
  overflow: hidden;     
  text-overflow: ellipsis; 
  margin: 0;
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
      <StyledEllipsisParagraph>
        {objectMetadataItem.labelPlural}
      </StyledEllipsisParagraph>
      <SettingsDataModelObjectTypeTag objectTypeLabel={objectTypeLabel} />
    </StyledObjectSummary>
  );
};
