import { type Context } from 'react';

import { ViewType } from '~/generated/graphql';

import { useViews } from './useViews';

export const useBoardViews = ({
  objectId,
  scopeContext,
}: {
  objectId: 'company';
  scopeContext: Context<string | null>;
}) => {
  useViews({
    objectId,
    type: ViewType.Pipeline,
    scopeContext,
  });
};
