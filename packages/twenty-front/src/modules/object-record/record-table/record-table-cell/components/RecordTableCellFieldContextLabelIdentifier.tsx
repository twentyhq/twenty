import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ReactNode, useContext } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

type RecordTableCellFieldContextLabelIdentifierProps = {
  children: ReactNode;
};

export const RecordTableCellFieldContextLabelIdentifier = ({
  children,
}: RecordTableCellFieldContextLabelIdentifierProps) => {
  const { indexIdentifierUrl } = useRecordIndexContextOrThrow();
  const { recordId, isReadOnly: isTableRowReadOnly } =
    useRecordTableRowContextOrThrow();

  const { columnDefinition } = useContext(RecordTableCellContext);

  const isMobile = useIsMobile();
  const isRecordTableScrolledLeftComponent = useRecoilComponentValueV2(
    isRecordTableScrolledLeftComponentState,
  );

  const isFieldReadOnly = useIsFieldValueReadOnly({
    fieldDefinition: columnDefinition,
    isRecordReadOnly: isTableRowReadOnly ?? false,
  });

  const updateRecord = useContext(RecordUpdateContext);

  const isLabelIdentifierCompact =
    isMobile && !isRecordTableScrolledLeftComponent;

  return (
    <FieldContext.Provider
      value={{
        recordId,
        fieldDefinition: columnDefinition,
        useUpdateRecord: () => [updateRecord, {}],
        labelIdentifierLink: indexIdentifierUrl(recordId),
        isLabelIdentifier: true,
        isLabelIdentifierCompact,
        displayedMaxRows: 1,
        isReadOnly: isFieldReadOnly,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
