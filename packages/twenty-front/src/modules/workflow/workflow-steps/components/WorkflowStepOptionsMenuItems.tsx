import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCopyPlus, IconPencil, IconTrash } from 'twenty-ui/icon';
import { Menu } from 'twenty-ui/primitives/surfaces';

type WorkflowStepOptionsMenuItemsProps = {
  changeNodeText: string;
  onChangeNode: () => void;
  onDuplicateNode?: () => void;
  onDeleteNode?: () => void;
  children?: ReactNode;
};

export const WorkflowStepOptionsMenuItems = ({
  changeNodeText,
  onChangeNode,
  onDuplicateNode,
  onDeleteNode,
  children,
}: WorkflowStepOptionsMenuItemsProps) => {
  const { t } = useLingui();

  return (
    <>
      <Menu.Item
        startIcon={<IconPencil />}
        onClick={onChangeNode}
        closeOnClick={false}
      >
        {changeNodeText}
      </Menu.Item>
      {isDefined(onDuplicateNode) && (
        <Menu.Item
          startIcon={<IconCopyPlus />}
          onClick={onDuplicateNode}
        >{t`Duplicate node`}</Menu.Item>
      )}
      {children}
      {isDefined(onDeleteNode) && (
        <Menu.Item
          startIcon={<IconTrash />}
          color="danger"
          onClick={onDeleteNode}
        >{t`Delete node`}</Menu.Item>
      )}
    </>
  );
};
