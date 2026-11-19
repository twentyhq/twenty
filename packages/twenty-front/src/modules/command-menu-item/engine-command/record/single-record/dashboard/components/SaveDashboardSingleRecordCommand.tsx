import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { useSavePageLayoutWidgetsData } from '@/page-layout/hooks/useSavePageLayoutWidgetsData';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { hasIncompletePageLayoutConditionalAvailabilityDraftFamilySelector } from '@/page-layout/states/selectors/hasIncompletePageLayoutConditionalAvailabilityDraftFamilySelector';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { useToast } from 'twenty-ui/components/feedback';

export const SaveDashboardSingleRecordCommand = () => {
  const { t } = useLingui();
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];

  if (!isDefined(selectedRecord)) {
    throw new Error(
      doNotTranslate('Selected record is required to save dashboard'),
    );
  }

  const pageLayoutId = selectedRecord.pageLayoutId;

  const { savePageLayout } = useSavePageLayout(pageLayoutId);

  const { savePageLayoutWidgetsData } = useSavePageLayoutWidgetsData();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { closeSidePanelMenu } = useSidePanelMenu();

  const store = useStore();
  const { enqueueToast } = useToast();

  const handleExecute = async () => {
    if (
      store.get(
        hasIncompletePageLayoutConditionalAvailabilityDraftFamilySelector.selectorFamily(
          pageLayoutId,
        ),
      )
    ) {
      enqueueToast({
        status: 'error',
        children: t`A visibility rule is incomplete`,
      });
      return;
    }

    const result = await savePageLayout();

    if (result.status === 'successful') {
      await savePageLayoutWidgetsData(pageLayoutId);
      closeSidePanelMenu();
      setIsPageLayoutInEditMode(false);
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
