import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TabListButton } from '@/ui/layout/tab-list/components/TabListButton';
import { type TabListButtonProps } from '@/ui/layout/tab-list/types/TabListButtonProps';
import { DragDropItemSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemSortableHandleRefContext';

const StyledTabButton = styled(TabListButton)<{ isHighlighted: boolean }>`
  & > span {
    border-radius: ${themeCssVariables.border.radius.sm};
    outline: ${({ isHighlighted }) =>
      isHighlighted ? `1px solid ${themeCssVariables.color.blue}` : 'none'};
    outline-offset: -1px;
  }
`;

type PageLayoutTabListDragHandleProps = Pick<
  TabListButtonProps,
  | 'asTab'
  | 'id'
  | 'active'
  | 'disabled'
  | 'LeftIcon'
  | 'title'
  | 'logo'
  | 'pill'
  | 'onClick'
> & {
  isHighlighted: boolean;
};

export const PageLayoutTabListDragHandle = ({
  asTab,
  id,
  active,
  disabled,
  LeftIcon,
  title,
  logo,
  pill,
  isHighlighted,
  onClick,
}: PageLayoutTabListDragHandleProps) => {
  const handleRef = useContext(DragDropItemSortableHandleRefContext);

  return (
    <StyledTabButton
      asTab={asTab}
      id={id}
      active={active}
      disabled={disabled}
      LeftIcon={LeftIcon}
      title={title}
      logo={logo}
      pill={pill}
      isHighlighted={isHighlighted}
      onClick={onClick}
      ref={handleRef}
      data-dnd-sortable-handle
    />
  );
};
