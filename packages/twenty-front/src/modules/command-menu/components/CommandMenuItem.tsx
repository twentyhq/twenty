import { isNonEmptyString } from '@sniptt/guards';

import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { ReactNode } from 'react';
import { IconArrowUpRight, IconComponent } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';

export type CommandMenuItemProps = {
  label: string;
  description?: string;
  to?: string;
  id: string;
  onClick?: () => void;
  Icon?: IconComponent;
  hotKeys?: string[];
  RightComponent?: ReactNode;
};

export const CommandMenuItem = ({
  label,
  description,
  to,
  id,
  onClick,
  Icon,
  hotKeys,
  RightComponent,
}: CommandMenuItemProps) => {
  const { onItemClick } = useCommandMenuOnItemClick();

  if (isNonEmptyString(to) && !Icon) {
    Icon = IconArrowUpRight;
  }

  const isSelectedItemId = useRecoilComponentFamilyValueV2(
    isSelectedItemIdComponentFamilySelector,
    id,
  );

  return (
    <MenuItemCommand
      LeftIcon={Icon}
      text={label}
      description={description}
      hotKeys={hotKeys}
      onClick={() =>
        onItemClick({
          onClick,
          to,
        })
      }
      isSelected={isSelectedItemId}
      RightComponent={RightComponent}
    />
  );
};
