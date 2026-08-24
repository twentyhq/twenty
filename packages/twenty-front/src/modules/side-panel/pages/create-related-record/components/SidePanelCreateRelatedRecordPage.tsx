import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type RelatedRecordActionBinding } from '@/activities/types/RelatedRecordAction';
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
  actionBindings: RelatedRecordActionBinding[];
};

export const SidePanelCreateRelatedRecordActionList = ({
  actionBindings,
}: SidePanelCreateRelatedRecordActionListProps) => {
  const visibleActionBindings = actionBindings.filter(
    ({ action }) => action.isVisible,
  );

  const selectableItemIds = visibleActionBindings
    .filter(({ action }) => !action.disabled)
    .map(({ action }) => action.id);

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      <SidePanelGroup heading={t`Actions`}>
        {visibleActionBindings.map(({ action, supportElement }) => (
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

const SidePanelCreateRelatedRecordActionListContainer = ({
  targetRecord,
}: {
  targetRecord: ActivityTargetableObject;
}) => {
  const { closeSidePanelMenu } = useSidePanelMenu();
  const actionBindings = useRelatedRecordActions({
    targetRecord,
    onFileUploadComplete: closeSidePanelMenu,
  });

  return (
    <SidePanelCreateRelatedRecordActionList actionBindings={actionBindings} />
  );
};

export const SidePanelCreateRelatedRecordPage = () => {
  const createRelatedRecordTarget = useAtomComponentStateValue(
    createRelatedRecordTargetComponentState,
  );

  if (!isDefined(createRelatedRecordTarget)) {
    return null;
  }

  return (
    <SidePanelCreateRelatedRecordActionListContainer
      targetRecord={createRelatedRecordTarget}
    />
  );
};
