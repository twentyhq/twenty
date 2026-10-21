import { styled } from '@linaria/react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordIdentifierTitle } from '@/object-record/record-show/hooks/useRecordIdentifierTitle';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';

const StyledTitle = styled.div`
  flex-shrink: 1;
  min-width: 0;
`;

type RecordShowPageHeaderRecordTitleProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const RecordShowPageHeaderRecordTitle = ({
  objectNameSingular,
  objectRecordId,
}: RecordShowPageHeaderRecordTitleProps) => {
  const { titleFieldContextValue } = useRecordIdentifierTitle({
    objectNameSingular,
    objectRecordId,
  });

  return (
    <StyledTitle>
      <FieldContext.Provider value={titleFieldContextValue}>
        <RecordTitleCell
          sizeVariant="sm"
          containerType={RecordTitleCellContainerType.PageHeader}
        />
      </FieldContext.Provider>
    </StyledTitle>
  );
};
