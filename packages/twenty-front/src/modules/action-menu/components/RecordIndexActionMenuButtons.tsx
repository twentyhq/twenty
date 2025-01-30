import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { i18n } from '@lingui/core';
import { Button } from 'twenty-ui';

export const RecordIndexActionMenuButtons = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const pinnedEntries = actionMenuEntries.filter((entry) => entry.isPinned);

  return (
    <>
      {pinnedEntries.map((entry, index) => (
        <Button
          key={index}
          Icon={entry.Icon}
          size="small"
          variant="secondary"
          accent="default"
          title={entry.shortLabel ? i18n._(entry.shortLabel) : ''}
          onClick={entry.onClick}
          ariaLabel={i18n._(entry.label)}
        />
      ))}
    </>
  );
};
