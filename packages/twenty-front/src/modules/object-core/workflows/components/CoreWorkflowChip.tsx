import { useQuery } from '@apollo/client/react';
import { useContext } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Chip } from 'twenty-ui/primitives/data-display';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { GetCoreWorkflowDocument } from '~/generated/graphql';

type CoreWorkflowChipProps = FieldDisplayTooltipProps & {
  coreRecordId: string;
};

export const CoreWorkflowChip = ({
  coreRecordId,
  withTooltip,
  measureOverflowOnOpen,
}: CoreWorkflowChipProps) => {
  const { disableChipClick, triggerEvent } = useContext(FieldContext);

  const apolloCoreClient = useApolloCoreClient();

  const { data } = useQuery(GetCoreWorkflowDocument, {
    client: apolloCoreClient,
    fetchPolicy: 'cache-first',
    variables: { coreWorkflowId: coreRecordId },
  });

  if (!isDefined(data?.coreWorkflow)) {
    return null;
  }

  const coreWorkflowName = data.coreWorkflow.name;

  const { content } = getChipLabel(coreWorkflowName);

  const avatar = (
    <AvatarOrIcon
      name={coreWorkflowName ?? undefined}
      colorSeed={coreRecordId}
      shape="circle"
    />
  );

  if (disableChipClick) {
    return (
      <Chip
        withTooltip={withTooltip}
        measureOverflowOnOpen={measureOverflowOnOpen}
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
      withTooltip={withTooltip}
      measureOverflowOnOpen={measureOverflowOnOpen}
      to={getAppPath(AppPath.WorkflowCoreShowPage, {
        coreWorkflowId: coreRecordId,
      })}
      variant="soft"
      startElement={avatar}
      triggerEvent={triggerEvent}
    >
      {content}
    </LinkChip>
  );
};
