import { MenuItem } from 'twenty-ui';

export const RecordBoardColumnHeaderAggregateDropdownMenuItem = ({
  onContentChange,
  text,
  hasSubMenu,
}: {
  onContentChange: () => void;
  hasSubMenu: boolean;
  text: string;
}) => {
  return (
    <MenuItem onClick={onContentChange} text={text} hasSubMenu={hasSubMenu} />
  );
};
