import { useQuery } from '@apollo/client/react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { CoreWorkflowRunRelationChip } from '@/object-core/workflows/components/CoreWorkflowRunRelationChip';
import { useOpenCoreWorkflowVersionSidePanel } from '@/object-core/workflows/versions/hooks/useOpenCoreWorkflowVersionSidePanel';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GetCoreWorkflowVersionsDocument } from '~/generated/graphql';

type CoreWorkflowVersionChipProps = {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
};

export const CoreWorkflowVersionChip = ({
  coreWorkflowId,
  coreWorkflowVersionId,
}: CoreWorkflowVersionChipProps) => {
  const apolloCoreClient = useApolloCoreClient();

  const { openCoreWorkflowVersionSidePanel } =
    useOpenCoreWorkflowVersionSidePanel();

  const { data } = useQuery(GetCoreWorkflowVersionsDocument, {
    client: apolloCoreClient,
    variables: { coreWorkflowId },
  });

  const coreWorkflowVersion = data?.coreWorkflowVersions.find(
    (version) => version.id === coreWorkflowVersionId,
  );

  if (!isDefined(coreWorkflowVersion)) {
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
