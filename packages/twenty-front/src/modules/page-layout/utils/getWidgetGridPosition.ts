import { isDefined } from 'twenty-shared/utils';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

// Widgets carry their grid position either as the GraphQL union or as the
// plain gridPosition field depending on where they came from; the union wins.
export const getWidgetGridPosition = (widget: PageLayoutWidget) =>
  isDefined(widget.position) &&
  widget.position.__typename === 'PageLayoutWidgetGridPosition'
    ? widget.position
    : widget.gridPosition;
