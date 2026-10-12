import { useQuery } from '@apollo/client/react';
import { useContext } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Chip } from 'twenty-ui/primitives/data-display';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { GetCoreWorkflowDocument } from '~/generated/graphql';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const CoreWorkflowRunWorkflowFieldDisplay = () => {
  const { recordId, disableChipClick, triggerEvent } = useContext(FieldContext);

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

  const coreWorkflowName = data.coreWorkflow.name;

  const { content } = getChipLabel(coreWorkflowName);

  const avatar = (
    <AvatarOrIcon
      name={coreWorkflowName ?? undefined}
      colorSeed={coreWorkflowId}
      shape="circle"
    />
  );

  if (disableChipClick === true) {
    return (
      <Chip
        variant="ghost"
        startElement={avatar}
        style={{ paddingInlineStart: 0 }}
      >
        {content}
      </Chip>
    );
  }

  return (
    <LinkChip
      to={getAppPath(AppPath.WorkflowCoreShowPage, { coreWorkflowId })}
      variant="soft"
      startElement={avatar}
      triggerEvent={triggerEvent}
    >
      {content}
    </LinkChip>
  );
};
