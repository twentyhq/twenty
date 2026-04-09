import { isArray } from '@sniptt/guards';
import { isString } from 'class-validator';

import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { DEFAULT_ITERATOR_CURRENT_ITEM } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/default-iterator-current-item.const';
import { type InputSchemaPropertyType } from 'src/modules/workflow/workflow-builder/workflow-schema/types/input-schema.type';
import { type Leaf } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export const generateFakeArrayItem = ({
  items,
}: {
  items: unknown[] | string;
}): Leaf => {
  let parsedItems: unknown[] | string;

  try {
    parsedItems = isString(items) ? JSON.parse(items) : items;
  } catch {
    return DEFAULT_ITERATOR_CURRENT_ITEM;
  }

  if (isArray(parsedItems) && parsedItems.length > 0) {
    const type = typeof parsedItems[0];

    return {
      label: 'Current Item',
      isLeaf: true,
      type: type as InputSchemaPropertyType,
      value: generateFakeValue(type),
    };
  }

  return DEFAULT_ITERATOR_CURRENT_ITEM;
};
