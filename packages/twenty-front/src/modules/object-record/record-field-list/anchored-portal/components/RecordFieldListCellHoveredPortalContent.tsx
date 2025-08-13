import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useFieldListFieldMetadataFromPosition } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataFromPosition';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellDisplayMode } from '@/object-record/record-inline-cell/components/RecordInlineCellDisplayMode';
import { RecordInlineCellHoveredPortalContent } from '@/object-record/record-inline-cell/components/RecordInlineCellHoveredPortalContent';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledClickableContainer = styled.div<{
  readonly?: boolean;
  isCentered?: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;

  ${({ isCentered }) =>
    isCentered === true &&
    `
      justify-content: center;
    `};

  ${({ readonly }) =>
    !readonly &&
    css`
      cursor: pointer;
    `};
`;

export const RecordFieldListCellHoveredPortalContent = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const hoverPosition = useRecoilComponentValue(
    recordFieldListHoverPositionComponentState,
  );

  const { editModeContentOnly, isCentered } = useRecordInlineCellContext();

  const { hoveredFieldMetadataItem } = useFieldListFieldMetadataFromPosition({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { isRecordFieldReadOnly } = useContext(FieldContext);

  if (!isDefined(hoverPosition) || !isDefined(hoveredFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordInlineCellHoveredPortalContent
      isReadOnly={isRecordFieldReadOnly}
      isRowActive={false}
    >
      <StyledClickableContainer
        readonly={isRecordFieldReadOnly}
        isCentered={isCentered}
      >
        <RecordInlineCellDisplayMode>
          {editModeContentOnly ? <FieldInput /> : <FieldDisplay />}
        </RecordInlineCellDisplayMode>
      </StyledClickableContainer>
    </RecordInlineCellHoveredPortalContent>
  );
};
