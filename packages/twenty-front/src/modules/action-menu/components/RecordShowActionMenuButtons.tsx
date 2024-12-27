import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { PageHeaderOpenCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderOpenCommandMenuButton';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { Button, IconButton, useIsMobile } from 'twenty-ui';

export const RecordShowActionMenuButtons = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const pinnedEntries = actionMenuEntries.filter((entry) => entry.isPinned);

  const isMobile = useIsMobile();

  return (
    <>
      {!isMobile &&
        pinnedEntries.map((entry) =>
          entry.shortLabel ? (
            <Button
              key={entry.key}
              Icon={entry.Icon}
              size="small"
              variant="secondary"
              accent="default"
              title={entry.shortLabel}
              onClick={() => entry.onClick?.()}
              ariaLabel={entry.label}
            />
          ) : (
            <IconButton
              key={entry.key}
              Icon={entry.Icon}
              size="small"
              variant="secondary"
              accent="default"
              onClick={() => entry.onClick?.()}
              ariaLabel={entry.label}
            />
          ),
        )}
      <PageHeaderOpenCommandMenuButton key="more" />
    </>
  );
};
