import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';
import { GraphLayoutType } from '~/generated/graphql';

export const getChartGraphLayoutOptions = (option: GraphLayoutType) => {
  switch (option) {
    case GraphLayoutType.HORIZONTAL:
      return t`Horizontal`;
    case GraphLayoutType.VERTICAL:
      return t`Vertical`;
    default:
      assertUnreachable(option);
  }
};
