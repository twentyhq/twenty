import { useQuery } from '@apollo/client/react';
import { useContext } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Chip } from 'twenty-ui/primitives/data-display';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';
import { FieldDisplayTooltipContext } from '@/ui/field/display/contexts/FieldDisplayTooltipContext';
import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { GetCoreWorkflowDocument } from '~/generated/graphql';

type CoreWorkflowChipProps = {
  coreRecordId: string;
};

export const CoreWorkflowChip = ({ coreRecordId }: CoreWorkflowChipProps) => {
  const { disableChipClick, triggerEvent } = useContext(FieldContext);
  const { withTooltip, measureOverflowOnOpen, getInitialPointerPosition } =
    useContext(FieldDisplayTooltipContext);

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
        initialPointerPosition={
          withTooltip ? getInitialPointerPosition?.() : undefined
        }
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
      initialPointerPosition={
        withTooltip ? getInitialPointerPosition?.() : undefined
      }
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
