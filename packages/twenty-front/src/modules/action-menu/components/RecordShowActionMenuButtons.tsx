import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { PageHeaderOpenCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderOpenCommandMenuButton';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { Button, useIsMobile } from 'twenty-ui';

export const RecordShowActionMenuButtons = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const pinnedEntries = actionMenuEntries.filter((entry) => entry.isPinned);

  const isMobile = useIsMobile();

  return (
    <>
      {!isMobile &&
        pinnedEntries.map((entry, index) => (
          <Button
            key={index}
            Icon={entry.Icon}
            size="small"
            variant="secondary"
            accent="default"
            title={entry.label}
            onClick={() => entry.onClick?.()}
            ariaLabel={entry.label}
          />
        ))}
      <PageHeaderOpenCommandMenuButton key="more" />
    </>
  );
};
