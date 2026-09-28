import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { IconCopyPlus, IconPencil, IconTrash } from 'twenty-ui/icon';

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
      <Dropdown.ActionItem startIcon={<IconPencil />} onClick={onChangeNode}>
        {changeNodeText}
      </Dropdown.ActionItem>
      {isDefined(onDuplicateNode) ? (
        <Dropdown.ActionItem
          startIcon={<IconCopyPlus />}
          onClick={onDuplicateNode}
        >{t`Duplicate node`}</Dropdown.ActionItem>
      ) : null}
      {children}
      {isDefined(onDeleteNode) ? (
        <Dropdown.ActionItem
          startIcon={<IconTrash />}
          color="danger"
          onClick={onDeleteNode}
        >{t`Delete node`}</Dropdown.ActionItem>
      ) : null}
    </>
  );
};
