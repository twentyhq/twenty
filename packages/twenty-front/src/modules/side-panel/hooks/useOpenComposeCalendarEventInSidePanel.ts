import { type CalendarEventComposerInitialValues } from '@/activities/calendar/types/CalendarEventComposerInitialValues';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { composeCalendarEventInitialValuesComponentState } from '@/side-panel/pages/compose-calendar-event/states/composeCalendarEventInitialValuesComponentState';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconCalendarEvent } from 'twenty-ui/icon';
import { v4 } from 'uuid';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useOpenComposeCalendarEventInSidePanel = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openComposeCalendarEventInSidePanel = useCallback(
    (initialValues: CalendarEventComposerInitialValues) => {
      const pageId = v4();

      store.set(
        composeCalendarEventInitialValuesComponentState.atomFamily({
          instanceId: pageId,
          surfaceId,
        }),
        initialValues,
      );

      navigateSidePanelMenu({
        page: SidePanelPages.ComposeCalendarEvent,
        pageTitle: t`New calendar event`,
        pageIcon: IconCalendarEvent,
        pageId,
      });
    },
    [navigateSidePanelMenu, store, surfaceId],
  );

  return { openComposeCalendarEventInSidePanel };
};
