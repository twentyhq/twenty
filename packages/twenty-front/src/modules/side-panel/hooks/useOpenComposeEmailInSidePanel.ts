import { useCallback } from 'react';

import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';
import {
  type IconComponent,
  IconArrowBackUp,
  IconMail,
} from 'twenty-ui/display';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { composeEmailConnectedAccountIdComponentState } from '@/side-panel/pages/compose-email/states/composeEmailConnectedAccountIdComponentState';
import { composeEmailDefaultInReplyToComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultInReplyToComponentState';
import { composeEmailDefaultSubjectComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultSubjectComponentState';
import { composeEmailDefaultToComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultToComponentState';
import { t } from '@lingui/core/macro';

type OpenComposeEmailParams = {
  threadId?: string;
  connectedAccountId: string;
  defaultTo?: string;
  defaultSubject?: string;
  defaultInReplyTo?: string;
  pageTitle?: string;
  pageIcon?: IconComponent;
};

export const useOpenComposeEmailInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openComposeEmailInSidePanel = useCallback(
    (params: OpenComposeEmailParams) => {
      const pageId = v4();

      const isReply = !!params.defaultInReplyTo;

      store.set(
        composeEmailConnectedAccountIdComponentState.atomFamily({
          instanceId: pageId,
        }),
        params.connectedAccountId,
      );

      store.set(
        composeEmailDefaultToComponentState.atomFamily({
          instanceId: pageId,
        }),
        params.defaultTo ?? '',
      );

      store.set(
        composeEmailDefaultSubjectComponentState.atomFamily({
          instanceId: pageId,
        }),
        params.defaultSubject ?? '',
      );

      store.set(
        composeEmailDefaultInReplyToComponentState.atomFamily({
          instanceId: pageId,
        }),
        params.defaultInReplyTo ?? '',
      );

      navigateSidePanelMenu({
        page: SidePanelPages.ComposeEmail,
        pageTitle: params.pageTitle ?? (isReply ? t`Reply` : t`New Email`),
        pageIcon: params.pageIcon ?? (isReply ? IconArrowBackUp : IconMail),
        pageId,
      });
    },
    [navigateSidePanelMenu, store],
  );

  return { openComposeEmailInSidePanel };
};
