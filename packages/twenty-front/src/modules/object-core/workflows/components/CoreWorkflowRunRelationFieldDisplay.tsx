import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CoreWorkflowChip } from '@/object-core/workflows/components/CoreWorkflowChip';
import { CoreWorkflowVersionChip } from '@/object-core/workflows/components/CoreWorkflowVersionChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const CoreWorkflowRunRelationFieldDisplay = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const coreWorkflowId = useRecordFieldValue<string | null>(
    recordId,
    'coreWorkflowId',
    { type: FieldMetadataType.UUID, metadata: { fieldName: 'coreWorkflowId' } },
  );

  const coreWorkflowVersionId = useRecordFieldValue<string | null>(
    recordId,
    'coreWorkflowVersionId',
    {
      type: FieldMetadataType.UUID,
      metadata: { fieldName: 'coreWorkflowVersionId' },
    },
  );

  if (!isDefined(coreWorkflowId)) {
    return null;
  }

  if (fieldDefinition.metadata.fieldName === 'workflowVersion') {
    return isDefined(coreWorkflowVersionId) ? (
      <CoreWorkflowVersionChip
        coreWorkflowId={coreWorkflowId}
        coreWorkflowVersionId={coreWorkflowVersionId}
      />
    ) : null;
  }

  return <CoreWorkflowChip coreWorkflowId={coreWorkflowId} />;
};
