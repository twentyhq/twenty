import { useCallback } from 'react';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconMail } from 'twenty-ui/icon';

export const useOpenComposeEmailToRelatedPeoplePickerInSidePanel = () => {
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openComposeEmailToRelatedPeoplePickerInSidePanel = useCallback(
    ({ contextStoreInstanceId }: { contextStoreInstanceId: string }) => {
      navigateSidePanelMenu({
        page: SidePanelPages.ComposeEmailToRelatedPeoplePicker,
        pageTitle: t`Send Email`,
        pageIcon: IconMail,
        pageId: contextStoreInstanceId,
      });
    },
    [navigateSidePanelMenu],
  );

  return { openComposeEmailToRelatedPeoplePickerInSidePanel };
};
