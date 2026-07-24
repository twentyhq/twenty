import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetHeaderInfoComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderInfoComponentFamilyState';
import { type WidgetHeaderInfo } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

const OUTSIDE_WIDGET_INSTANCE_ID = 'widget-header-info-outside-widget';

// Publish header information (grey count next to the title, primary action on
// the right) from a widget's content to the widget chrome. Safe to call from
// components that also render outside a page layout: it no-ops there.
// Republishes only when a rendered value actually changes: the widget chrome
// reads this state above the widget content, so publishing a fresh object on
// every render (an inline primaryAction, an unstable onClick) would loop the
// widget subtree forever. onClick goes through a stable wrapper for the same
// reason, so callers do not have to memoize anything.
export const usePublishWidgetHeaderInfo = ({
  count,
  primaryAction,
}: WidgetHeaderInfo) => {
  const pageLayoutInstanceId = useAvailableComponentInstanceId(
    PageLayoutComponentInstanceContext,
  );
  const widgetInstanceId = useAvailableComponentInstanceId(
    WidgetComponentInstanceContext,
  );

  const isInsideWidget =
    isDefined(pageLayoutInstanceId) && isDefined(widgetInstanceId);

  const setWidgetHeaderInfo = useSetAtomComponentFamilyState(
    widgetHeaderInfoComponentFamilyState,
    widgetInstanceId ?? OUTSIDE_WIDGET_INSTANCE_ID,
    pageLayoutInstanceId ?? OUTSIDE_WIDGET_INSTANCE_ID,
  );

  // oxlint-disable-next-line twenty/no-state-useref
  const onClickRef = useRef(primaryAction?.onClick);

  const primaryActionOnClick = primaryAction?.onClick;

  // Assigned after commit so the stable wrapper never exposes a callback from
  // a render React abandoned.
  useLayoutEffect(() => {
    onClickRef.current = primaryActionOnClick;
  }, [primaryActionOnClick]);

  const handlePrimaryActionClick = useCallback(() => {
    onClickRef.current?.();
  }, []);

  const hasPrimaryAction = isDefined(primaryAction);
  const primaryActionIcon = primaryAction?.Icon;
  const primaryActionLabel = primaryAction?.label;
  const primaryActionDisabled = primaryAction?.disabled;

  useEffect(() => {
    if (!isInsideWidget) {
      return;
    }

    setWidgetHeaderInfo({
      count,
      primaryAction:
        hasPrimaryAction && isDefined(primaryActionIcon)
          ? {
              Icon: primaryActionIcon,
              label: primaryActionLabel ?? '',
              onClick: handlePrimaryActionClick,
              disabled: primaryActionDisabled,
            }
          : undefined,
    });
  }, [
    count,
    hasPrimaryAction,
    primaryActionIcon,
    primaryActionLabel,
    primaryActionDisabled,
    handlePrimaryActionClick,
    isInsideWidget,
    setWidgetHeaderInfo,
  ]);

  useEffect(() => {
    if (!isInsideWidget) {
      return;
    }

    return () => {
      setWidgetHeaderInfo(null);
    };
  }, [isInsideWidget, setWidgetHeaderInfo]);
};
