import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { t } from '@lingui/core/macro';
import { type MouseEvent, useState } from 'react';
import { LightIconButton } from 'twenty-ui/components';
import { IconPencil } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

type PageLayoutTabMenuItemSelectAvatarProps = {
  tab: SingleTabProps;
  selected: boolean;
  onClick?: (event?: MouseEvent) => void;
  disabled?: boolean;
  showEditButton?: boolean;
  onEditClick?: (tabId: string) => void;
  testId?: string;
};

export const PageLayoutTabMenuItemSelectAvatar = ({
  tab,
  selected,
  onClick,
  disabled,
  showEditButton = false,
  onEditClick,
  testId,
}: PageLayoutTabMenuItemSelectAvatarProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ListItem
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      startIcon={<TabAvatar tab={tab} />}
      selected={selected && !isHovered}
      indicator="check"
      actions={
        isHovered &&
        showEditButton && (
          <LightIconButton
            size="sm"
            emphasis="subtle"
            aria-label={t`Edit tab icon`}
            onClick={(event) => {
              event.stopPropagation();
              onEditClick?.(tab.id);
            }}
          >
            <IconPencil />
          </LightIconButton>
        )
      }
    >
      {tab.title}
    </ListItem>
  );
};
