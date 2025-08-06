import styled from '@emotion/styled';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { hasRecordTableFetchedAllRecordsComponentState } from '@/object-record/record-table/states/hasRecordTableFetchedAllRecordsComponentState';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/display';

const StyledTableRow = styled.tr`
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.animation.duration.fast}
    ease-in-out;
  z-index: ${TABLE_Z_INDEX.footer.default};
  position: sticky;
  border: none;
  background: ${({ theme }) => theme.background.primary};

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
    background-color: ${({ theme }) => theme.background.primary};
    z-index: ${TABLE_Z_INDEX.footer.default};
    position: sticky;

    &:first-of-type {
      border-bottom: 1px solid ${({ theme }) => theme.background.primary};
    }
  }
`;

const StyledIconContainer = styled(RecordTableTd)`
  align-items: center;
  background-color: transparent;
  border-right: none;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  height: 32px;
  justify-content: center;
`;

const StyledRecordTableTdTextContainer = styled(RecordTableTd)`
  background-color: transparent;
  border-right: none;
  height: 32px;
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.md};
  text-align: center;
  vertical-align: middle;
`;

export const RecordTableAddNew = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const theme = useTheme();

  const visibleTableColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
  );

  const hasRecordTableFetchedAllRecords = useRecoilComponentValue(
    hasRecordTableFetchedAllRecordsComponentState,
  );

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  if (!hasObjectUpdatePermissions || !hasRecordTableFetchedAllRecords) {
    return null;
  }

  return (
    <StyledTableRow
      onClick={() => {
        createNewIndexRecord({
          position: 'last',
        });
      }}
    >
      <td aria-hidden />
      <StyledIconContainer>
        <IconPlus
          stroke={theme.icon.stroke.sm}
          size={theme.icon.size.sm}
          color={theme.font.color.tertiary}
        />
      </StyledIconContainer>
      <StyledRecordTableTdTextContainer className="disable-shadow">
        <StyledText>{t`Add new`}</StyledText>
      </StyledRecordTableTdTextContainer>
      <td colSpan={visibleTableColumns.length - 1} aria-hidden />
      <td aria-hidden />
      <td aria-hidden />
    </StyledTableRow>
  );
};
