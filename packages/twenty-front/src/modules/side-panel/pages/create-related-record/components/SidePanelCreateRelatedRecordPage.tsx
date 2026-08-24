import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useRelatedRecordActions } from '@/activities/hooks/useRelatedRecordActions';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { createRelatedRecordTargetComponentState } from '@/side-panel/pages/create-related-record/states/createRelatedRecordTargetComponentState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

type SidePanelCreateRelatedRecordActionListProps = {
  targetRecord: ActivityTargetableObject;
};

const SidePanelCreateRelatedRecordActionList = ({
  targetRecord,
}: SidePanelCreateRelatedRecordActionListProps) => {
  const { closeSidePanelMenu } = useSidePanelMenu();
  const actionBindings = useRelatedRecordActions({
    targetRecord,
    onFileUploadComplete: closeSidePanelMenu,
  }).filter(({ action }) => action.isVisible);

  const selectableItemIds = actionBindings
    .filter(({ action }) => !action.disabled)
    .map(({ action }) => action.id);

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      <SidePanelGroup heading={t`Actions`}>
        {actionBindings.map(({ action, supportElement }) => (
          <SelectableListItem
            key={action.id}
            itemId={action.id}
            onEnter={action.disabled ? undefined : action.execute}
          >
            {supportElement}
            <CommandMenuItem
              id={action.id}
              Icon={action.Icon}
              label={action.label}
              description={action.disabled ? action.disabledReason : undefined}
              onClick={action.disabled ? undefined : action.execute}
              disabled={action.disabled}
            />
          </SelectableListItem>
        ))}
      </SidePanelGroup>
    </SidePanelList>
  );
};

export const SidePanelCreateRelatedRecordPage = () => {
  const targetRecord = useAtomComponentStateValue(
    createRelatedRecordTargetComponentState,
  );

  if (!isDefined(targetRecord)) {
    return null;
  }

  return <SidePanelCreateRelatedRecordActionList targetRecord={targetRecord} />;
};
