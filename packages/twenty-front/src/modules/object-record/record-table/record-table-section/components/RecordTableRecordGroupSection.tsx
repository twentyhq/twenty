import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { IconChevronUp, isDefined, Tag } from 'twenty-ui';

import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { isRecordGroupTableSectionToggledComponentState } from '@/object-record/record-table/record-table-section/states/isRecordGroupTableSectionToggledComponentState';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useRecoilValue } from 'recoil';

const StyledTrContainer = styled.tr`
  cursor: pointer;
`;

const StyledChevronContainer = styled(RecordTableTd)`
  border-right: none;
  color: ${({ theme }) => theme.font.color.secondary};
  text-align: center;
  vertical-align: middle;
`;

const StyledTotalRow = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: ${({ theme }) => theme.spacing(2)};
  text-align: center;
  vertical-align: middle;
`;

const StyledRecordGroupSection = styled(RecordTableTd)`
  border-right: none;
  height: 32px;
`;

const StyledEmptyTd = styled.td`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const RecordTableRecordGroupSection = () => {
  const theme = useTheme();

  const currentRecordGroupId = useCurrentRecordGroupId();

  const visibleColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

  const recordIdsByGroup = useRecoilComponentFamilyValueV2(
    recordIndexRecordIdsByGroupComponentFamilyState,
    currentRecordGroupId,
  );

  const [
    isRecordGroupTableSectionToggled,
    setIsRecordGroupTableSectionToggled,
  ] = useRecoilComponentFamilyStateV2(
    isRecordGroupTableSectionToggledComponentState,
    currentRecordGroupId,
  );

  const recordGroup = useRecoilValue(
    recordGroupDefinitionFamilyState(currentRecordGroupId),
  );

  const handleDropdownToggle = useCallback(() => {
    setIsRecordGroupTableSectionToggled((prevState) => !prevState);
  }, [setIsRecordGroupTableSectionToggled]);

  if (!isDefined(recordGroup)) {
    return null;
  }

  return (
    <StyledTrContainer onClick={handleDropdownToggle}>
      <td aria-hidden />
      <StyledChevronContainer>
        <motion.span
          animate={{ rotate: isRecordGroupTableSectionToggled ? 180 : 0 }}
          transition={{ duration: theme.animation.duration.normal }}
          style={{
            display: 'inline-block',
          }}
        >
          <IconChevronUp size={theme.icon.size.md} />
        </motion.span>
      </StyledChevronContainer>
      <StyledRecordGroupSection colSpan={visibleColumns.length}>
        <Tag
          variant={
            recordGroup.type !== RecordGroupDefinitionType.NoValue
              ? 'solid'
              : 'outline'
          }
          color={
            recordGroup.type !== RecordGroupDefinitionType.NoValue
              ? recordGroup.color
              : 'transparent'
          }
          text={recordGroup.title}
          weight="medium"
        />
        <StyledTotalRow>{recordIdsByGroup.length}</StyledTotalRow>
      </StyledRecordGroupSection>
      <StyledEmptyTd />
      <StyledEmptyTd />
    </StyledTrContainer>
  );
};
