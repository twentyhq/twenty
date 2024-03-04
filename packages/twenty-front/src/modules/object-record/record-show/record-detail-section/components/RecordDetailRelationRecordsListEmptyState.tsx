import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';

type RecordDetailRelationRecordsListEmptyStateProps = {
  relationObjectMetadataItem: ObjectMetadataItem;
};

const StyledRelationRecordsListEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  display: flex;
  height: ${({ theme }) => theme.spacing(10)};
  text-transform: capitalize;
`;

export const RecordDetailRelationRecordsListEmptyState = ({
  relationObjectMetadataItem,
}: RecordDetailRelationRecordsListEmptyStateProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();
  const Icon = getIcon(relationObjectMetadataItem.icon);

  return (
    <StyledRelationRecordsListEmptyState>
      <Icon size={theme.icon.size.sm} />
      <div>No {relationObjectMetadataItem.labelSingular}</div>
    </StyledRelationRecordsListEmptyState>
  );
};
