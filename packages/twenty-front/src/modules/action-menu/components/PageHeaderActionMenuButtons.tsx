import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { i18n } from '@lingui/core';
import { Button, IconButton } from 'twenty-ui';

export const PageHeaderActionMenuButtons = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const pinnedEntries = actionMenuEntries.filter((entry) => entry.isPinned);

  return (
    <>
      {pinnedEntries.map((entry) =>
        entry.shortLabel ? (
          <Button
            key={entry.key || `action-menu-entry-${entry.label}`}
            Icon={entry.Icon}
            size="small"
            variant="secondary"
            accent="default"
            title={entry.shortLabel ? i18n._(entry.shortLabel) : ''}
            onClick={() => entry.onClick?.()}
            ariaLabel={i18n._(entry.label)}
          />
        ) : (
          <IconButton
            key={entry.key || `action-menu-entry-${entry.label}`}
            Icon={entry.Icon}
            size="small"
            variant="secondary"
            accent="default"
            onClick={() => entry.onClick?.()}
            ariaLabel={i18n._(entry.label)}
          />
        ),
      )}
    </>
  );
};
