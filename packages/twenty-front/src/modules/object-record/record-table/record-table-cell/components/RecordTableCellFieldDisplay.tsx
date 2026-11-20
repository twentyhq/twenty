import { ScopedRelationLookupFieldDisplay } from '@/object-record/record-column-scope/components/ScopedRelationLookupFieldDisplay';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellFieldDisplay = () => {
  const { recordField } = useContext(RecordTableCellContext);
  const { isForbidden } = useContext(FieldContext);

  const lookupTarget = useContext(ScopedRelationAliasesContext).find(
    ({ recordFieldId }) => recordFieldId === recordField.id,
  )?.lookupTarget;

  if (!isDefined(lookupTarget) || isForbidden === true) {
    return <FieldDisplay />;
  }

  return (
    <ScopedRelationLookupFieldDisplay
      lookupTargetFieldDefinition={lookupTarget.lookupTargetFieldDefinition}
    />
  );
};
