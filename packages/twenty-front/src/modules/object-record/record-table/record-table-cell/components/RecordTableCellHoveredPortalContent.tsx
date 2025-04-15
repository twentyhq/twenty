import { FieldDisplay } from '@/object-record/record-field/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';
import { hoverPositionComponentState } from '@/object-record/record-table/states/hoverPositionComponentState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useContext } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

export const RecordTableCellHoveredPortalContent = () => {
  const hoverPosition = useRecoilComponentValueV2(hoverPositionComponentState);

  const isInEditMode = useRecoilComponentFamilyValueV2(
    isTableCellInEditModeComponentFamilyState,
    hoverPosition,
  );

  const isMobile = useIsMobile();

  const isFirstColumn = hoverPosition.column === 0;

  const { isReadOnly } = useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly();

  const showButton =
    !isFieldInputOnly && !isReadOnly && !(isMobile && isFirstColumn);

  return (
    <>
      {isInEditMode ? (
        <RecordTableCellEditMode>
          <RecordTableCellFieldInput />
        </RecordTableCellEditMode>
      ) : (
        <>
          <RecordTableCellDisplayMode>
            <FieldDisplay />
          </RecordTableCellDisplayMode>
          {showButton && <RecordTableCellEditButton />}
        </>
      )}
    </>
  );
};
