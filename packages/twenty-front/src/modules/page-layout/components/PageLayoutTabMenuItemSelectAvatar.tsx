import { t } from '@lingui/core/macro';
import { type MouseEvent, useState } from 'react';
import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { IconPencil } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
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
      selected={selected && !isHovered}
      indicator="check"
      actionsVisibility="always"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      startIcon={<TabAvatar tab={tab} />}
      actions={
        isHovered &&
        showEditButton && (
          <LightIconButton
            size="sm"
            emphasis="subtle"
            onClick={(event) => {
              event.stopPropagation();
              onEditClick?.(tab.id);
            }}
            aria-label={t`Edit tab icon`}
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
