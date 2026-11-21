import { ScopedRelationLookupFieldDisplay } from '@/object-record/record-column-scope/components/ScopedRelationLookupFieldDisplay';
import { ScopedRelationSummaryFieldDisplay } from '@/object-record/record-column-summary/components/ScopedRelationSummaryFieldDisplay';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellFieldDisplay = () => {
  const { recordField } = useContext(RecordTableCellContext);
  const { isForbidden } = useContext(FieldContext);

  const scopedRelationAlias = useContext(ScopedRelationAliasesContext).find(
    ({ recordFieldId }) => recordFieldId === recordField.id,
  );
  const lookupTarget = scopedRelationAlias?.lookupTarget;

  if (isDefined(scopedRelationAlias?.summary) && isForbidden !== true) {
    return (
      <ScopedRelationSummaryFieldDisplay
        responseKey={scopedRelationAlias.responseKey}
        summary={scopedRelationAlias.summary}
      />
    );
  }

  if (!isDefined(lookupTarget) || isForbidden === true) {
    return <FieldDisplay />;
  }

  return (
    <ScopedRelationLookupFieldDisplay
      lookupTargetFieldDefinition={lookupTarget.lookupTargetFieldDefinition}
    />
  );
};
