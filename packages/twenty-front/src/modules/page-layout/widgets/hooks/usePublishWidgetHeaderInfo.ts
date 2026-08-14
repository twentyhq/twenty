import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetHeaderInfoComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderInfoComponentFamilyState';
import {
  type WidgetHeaderAction,
  type WidgetHeaderInfo,
} from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

const OUTSIDE_WIDGET_INSTANCE_ID = 'widget-header-info-outside-widget';

const areWidgetHeaderActionsEqual = (
  currentActions: WidgetHeaderAction[] | undefined,
  nextActions: WidgetHeaderAction[] | undefined,
) => {
  if (!isDefined(currentActions) || !isDefined(nextActions)) {
    return currentActions === nextActions;
  }

  return (
    currentActions.length === nextActions.length &&
    currentActions.every((currentAction, index) => {
      const nextAction = nextActions[index];

      return (
        currentAction.id === nextAction.id &&
        currentAction.Icon === nextAction.Icon &&
        currentAction.label === nextAction.label &&
        currentAction.disabled === nextAction.disabled &&
        currentAction.to === nextAction.to
      );
    })
  );
};

const isWidgetHeaderInfoEqual = (
  currentWidgetHeaderInfo: WidgetHeaderInfo | null,
  nextWidgetHeaderInfo: WidgetHeaderInfo,
) =>
  currentWidgetHeaderInfo?.count === nextWidgetHeaderInfo.count &&
  areWidgetHeaderActionsEqual(
    currentWidgetHeaderInfo?.actions,
    nextWidgetHeaderInfo.actions,
  );

export const usePublishWidgetHeaderInfo = ({
  count,
  actions,
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
  const actionsRef = useRef(actions);

  useLayoutEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    if (!isInsideWidget) {
      return;
    }

    const nextWidgetHeaderInfo: WidgetHeaderInfo = {
      count,
      actions: actions?.map((action): WidgetHeaderAction => {
        if (isDefined(action.to)) {
          return action;
        }

        return {
          id: action.id,
          Icon: action.Icon,
          label: action.label,
          disabled: action.disabled,
          onClick: () => {
            actionsRef.current?.find(({ id }) => id === action.id)?.onClick?.();
          },
        };
      }),
    };

    setWidgetHeaderInfo((currentWidgetHeaderInfo) =>
      isWidgetHeaderInfoEqual(currentWidgetHeaderInfo, nextWidgetHeaderInfo)
        ? currentWidgetHeaderInfo
        : nextWidgetHeaderInfo,
    );
  }, [actions, count, isInsideWidget, setWidgetHeaderInfo]);

  useEffect(() => {
    if (!isInsideWidget) {
      return;
    }

    return () => {
      setWidgetHeaderInfo(null);
    };
  }, [isInsideWidget, setWidgetHeaderInfo]);
};
