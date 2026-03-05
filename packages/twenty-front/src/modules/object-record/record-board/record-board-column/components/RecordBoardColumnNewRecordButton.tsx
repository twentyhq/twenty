import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNewButton = styled.button`
  align-items: center;
  align-self: baseline;
  background-color: ${themeCssVariables.background.primary};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};

  &:hover {
    background-color: ${themeCssVariables.background.tertiary};
  }
`;

export const RecordBoardColumnNewRecordButton = () => {
  const { theme } = useContext(ThemeContext);
  const { objectMetadataItem, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem: objectMetadataItem,
  });

  if (!hasObjectUpdatePermissions) {
    return null;
  }

  if (hasAnySoftDeleteFilterOnView) {
    return null;
  }

  return (
    <StyledNewButton
      onClick={async () => {
        await createNewIndexRecord({
          position: 'last',
          [selectFieldMetadataItem.name]: columnDefinition.value,
        });
      }}
    >
      <IconPlus size={theme.icon.size.md} />
      {t`New`}
    </StyledNewButton>
  );
};
