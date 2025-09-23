import { UPDATE_PAGE_LAYOUT_WITH_TABS_AND_WIDGETS } from '@/page-layout/graphql/mutations/updatePageLayoutWithTabsAndWidgets';
import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useMutation } from '@apollo/client';

export const useSavePageLayout = (pageLayoutIdFromProps: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const { pageLayoutDraft } = usePageLayoutDraftState(pageLayoutId);

  const [updatePageLayoutWithTabsAndWidgets] = useMutation(
    UPDATE_PAGE_LAYOUT_WITH_TABS_AND_WIDGETS,
  );

  const savePageLayout = async () => {
    const updateInput = convertPageLayoutDraftToUpdateInput(pageLayoutDraft);

    await updatePageLayoutWithTabsAndWidgets({
      variables: {
        id: pageLayoutId,
        input: updateInput,
      },
    });
  };

  return { savePageLayout };
};
