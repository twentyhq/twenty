import { type WidgetCardVariant } from '@/page-layout/widgets/types/WidgetCardVariant';

type IsWidgetCardFlushInViewModeParams = {
  isEditable: boolean;
  variant: WidgetCardVariant;
};

export const isWidgetCardFlushInViewMode = ({
  isEditable,
  variant,
}: IsWidgetCardFlushInViewModeParams): boolean =>
  variant === 'flush' && !isEditable;
