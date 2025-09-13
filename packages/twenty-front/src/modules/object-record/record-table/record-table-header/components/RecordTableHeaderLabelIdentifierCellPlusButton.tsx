import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledHeaderIcon = styled.div`
  margin: ${({ theme }) => theme.spacing(1, 1, 1, 1.5)};
`;

export const RecordTableHeaderLabelIdentifierCellPlusButton = () => {
  const { objectMetadataItem, objectPermissions } =
    useRecordTableContextOrThrow();

  const isMobile = useIsMobile();

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const handlePlusButtonClick = () => {
    createNewIndexRecord();
  };

  const isReadOnly = isObjectMetadataReadOnly({
    objectPermissions,
    objectMetadataItem,
  });

  const hasAnySoftDeleteFilterOnView = useRecoilComponentValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  return (
    !isMobile &&
    !isReadOnly &&
    hasObjectUpdatePermissions &&
    !hasAnySoftDeleteFilterOnView && (
      <StyledHeaderIcon>
        <LightIconButton
          Icon={IconPlus}
          size="small"
          accent="tertiary"
          onClick={handlePlusButtonClick}
        />
      </StyledHeaderIcon>
    )
  );
};
