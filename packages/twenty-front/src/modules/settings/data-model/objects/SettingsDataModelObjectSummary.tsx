import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsDataModelIsCustomTag } from '@/settings/data-model/objects/SettingsDataModelIsCustomTag';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';

export type SettingsDataModelObjectSummaryProps = {
  className?: string;
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'icon' | 'isCustom' | 'labelPlural'
  >;
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

  return (
    <StyledObjectSummary className={className}>
      <StyledObjectName>
        <ObjectIcon size={theme.icon.size.sm} stroke={theme.icon.stroke.md} />
        {objectMetadataItem.labelPlural}
      </StyledObjectName>
      <SettingsDataModelIsCustomTag isCustom={objectMetadataItem.isCustom} />
    </StyledObjectSummary>
  );
};
