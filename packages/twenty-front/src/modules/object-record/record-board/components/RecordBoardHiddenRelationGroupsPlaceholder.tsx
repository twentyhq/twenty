import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useRecordBoardRelationGroupsTotalCount } from '@/object-record/record-board/hooks/useRecordBoardRelationGroupsTotalCount';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

const StyledContainer = styled.div`
  padding-inline: ${themeCssVariables.spacing[2]};
`;

const StyledPill = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

export const RecordBoardHiddenRelationGroupsPlaceholder = () => {
  const { isRelationGrouping, totalRelationGroupsCount } =
    useRecordBoardRelationGroupsTotalCount();

  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const hiddenGroupsCount =
    totalRelationGroupsCount - recordGroupDefinitions.length;

  if (!isRelationGrouping || hiddenGroupsCount <= 0) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledPill>
        {plural(hiddenGroupsCount, {
          one: '# more group',
          other: '# more groups',
        })}
      </StyledPill>
    </StyledContainer>
  );
};
