import { ScopedRelationLookupFieldDisplay } from '@/object-record/record-column-scope/components/ScopedRelationLookupFieldDisplay';
import { ScopedRelationSummaryFieldDisplay } from '@/object-record/record-column-summary/components/ScopedRelationSummaryFieldDisplay';
import { useScopedRelationAlias } from '@/object-record/record-column-scope/hooks/useScopedRelationAlias';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellFieldDisplay = () => {
  const { recordField } = useContext(RecordTableCellContext);
  const { isForbidden } = useContext(FieldContext);

  const scopedRelationAlias = useScopedRelationAlias(recordField.id);
  const lookupTarget = scopedRelationAlias?.lookupTarget;

  if (isDefined(scopedRelationAlias?.summary) && !isForbidden) {
    return (
      <ScopedRelationSummaryFieldDisplay
        responseKey={scopedRelationAlias.responseKey}
        summary={scopedRelationAlias.summary}
      />
    );
  }

  if (!isDefined(lookupTarget) || isForbidden) {
    return <FieldDisplay />;
  }

  return (
    <ScopedRelationLookupFieldDisplay
      lookupTargetFieldDefinition={lookupTarget.lookupTargetFieldDefinition}
    />
  );
};
