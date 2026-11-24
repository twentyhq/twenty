import { ScopedRelationLookupFieldDisplay } from '@/object-record/record-column-scope/components/ScopedRelationLookupFieldDisplay';
import { ScopedRelationSummaryFieldDisplay } from '@/object-record/record-column-summary/components/ScopedRelationSummaryFieldDisplay';
import { useRecordFieldColumnKind } from '@/object-record/record-column-scope/hooks/useRecordFieldColumnKind';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellFieldDisplay = () => {
  const { recordField } = useContext(RecordTableCellContext);
  const { isForbidden } = useContext(FieldContext);

  const columnKind = useRecordFieldColumnKind(recordField.id);

  if (isForbidden) {
    return <FieldDisplay />;
  }

  if (columnKind.kind === 'summary' && isDefined(columnKind.summary)) {
    return (
      <ScopedRelationSummaryFieldDisplay
        responseKey={columnKind.scopedRelationAlias.responseKey}
        summary={columnKind.summary}
      />
    );
  }

  if (columnKind.kind === 'scopedLookup') {
    return (
      <ScopedRelationLookupFieldDisplay
        lookupTargetFieldDefinition={
          columnKind.lookupTarget.lookupTargetFieldDefinition
        }
      />
    );
  }

  return <FieldDisplay />;
};
