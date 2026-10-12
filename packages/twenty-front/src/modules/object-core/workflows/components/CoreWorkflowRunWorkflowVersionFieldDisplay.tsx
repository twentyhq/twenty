import { useQuery } from '@apollo/client/react';
import { useContext } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { CoreWorkflowRunRelationChip } from '@/object-core/workflows/components/CoreWorkflowRunRelationChip';
import { useOpenCoreWorkflowVersionSidePanel } from '@/object-core/workflows/versions/hooks/useOpenCoreWorkflowVersionSidePanel';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { GetCoreWorkflowVersionsDocument } from '~/generated/graphql';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const CoreWorkflowRunWorkflowVersionFieldDisplay = () => {
  const { recordId } = useContext(FieldContext);

  const apolloCoreClient = useApolloCoreClient();

  const { openCoreWorkflowVersionSidePanel } =
    useOpenCoreWorkflowVersionSidePanel();

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

  const { data } = useQuery(GetCoreWorkflowVersionsDocument, {
    client: apolloCoreClient,
    variables: { coreWorkflowId: coreWorkflowId ?? '' },
    skip: !isDefined(coreWorkflowId) || !isDefined(coreWorkflowVersionId),
  });

  const coreWorkflowVersion = data?.coreWorkflowVersions.find(
    (version) => version.id === coreWorkflowVersionId,
  );

  if (
    !isDefined(coreWorkflowId) ||
    !isDefined(coreWorkflowVersionId) ||
    !isDefined(coreWorkflowVersion)
  ) {
    return null;
  }

  return (
    <CoreWorkflowRunRelationChip
      label={coreWorkflowVersion.label}
      colorSeed={coreWorkflowVersionId}
      to={getAppPath(AppPath.WorkflowCoreShowPage, { coreWorkflowId })}
      onClick={() =>
        openCoreWorkflowVersionSidePanel({
          coreWorkflowVersionId,
          pageTitle: coreWorkflowVersion.label,
        })
      }
    />
  );
};
