import { type Dictionary } from '@blocknote/core';
import {
  type BlockTypeSelectItem,
  blockTypeSelectItems,
} from '@blocknote/react';
import { t } from '@lingui/core/macro';
import { IconTextSize } from 'twenty-ui/icon';

const TextBlockTypeIcon: BlockTypeSelectItem['icon'] = ({ size }) => (
  <IconTextSize size={size} />
);

export const getBlockTypeSelectItems = (
  dictionary: Dictionary,
): BlockTypeSelectItem[] =>
  blockTypeSelectItems(dictionary).map((item) =>
    item.type === 'paragraph'
      ? { ...item, name: t`Text`, icon: TextBlockTypeIcon }
      : item,
  );
