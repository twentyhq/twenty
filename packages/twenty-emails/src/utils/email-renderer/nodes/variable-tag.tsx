import { type JSONContent } from '@tiptap/core';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const variableTag = (node: JSONContent): ReactNode => {
  const { variable } = node?.attrs || {};
  if (!isDefined(variable)) {
    return <>&nbsp;</>;
  }

  return <>{variable}</>;
};
