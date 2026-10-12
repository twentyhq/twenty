import { useQuery } from '@apollo/client/react';
import { useContext } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { CoreWorkflowRunRelationChip } from '@/object-core/workflows/components/CoreWorkflowRunRelationChip';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { GetCoreWorkflowDocument } from '~/generated/graphql';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const CoreWorkflowRunWorkflowFieldDisplay = () => {
  const { recordId } = useContext(FieldContext);

  const apolloCoreClient = useApolloCoreClient();

  const coreWorkflowId = useRecordFieldValue<string | null>(
    recordId,
    'coreWorkflowId',
    { type: FieldMetadataType.UUID, metadata: { fieldName: 'coreWorkflowId' } },
  );

  const { data } = useQuery(GetCoreWorkflowDocument, {
    client: apolloCoreClient,
    variables: { coreWorkflowId: coreWorkflowId ?? '' },
    skip: !isDefined(coreWorkflowId),
  });

  if (!isDefined(coreWorkflowId) || !isDefined(data?.coreWorkflow)) {
    return null;
  }

  return (
    <CoreWorkflowRunRelationChip
      label={data.coreWorkflow.name}
      colorSeed={coreWorkflowId}
      to={getAppPath(AppPath.WorkflowCoreShowPage, { coreWorkflowId })}
    />
  );
};
