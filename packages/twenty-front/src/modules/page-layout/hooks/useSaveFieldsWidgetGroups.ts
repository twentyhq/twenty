import { UPSERT_FIELDS_WIDGET } from '@/page-layout/graphql/mutations/upsertFieldsWidget';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRefreshAllCoreViews } from '@/views/hooks/useRefreshAllCoreViews';
import { useMutation } from '@apollo/client';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type ViewFragmentFragment } from '~/generated-metadata/graphql';

type UpsertFieldsWidgetInput = {
  widgetId: string;
  groups?: {
    id: string;
    name: string;
    position: number;
    isVisible: boolean;
    fields: {
      viewFieldId: string;
      isVisible: boolean;
      position: number;
    }[];
  }[];
  fields?: {
    viewFieldId: string;
    isVisible: boolean;
    position: number;
  }[];
};

type UpsertFieldsWidgetResult = {
  upsertFieldsWidget: ViewFragmentFragment;
};

type UseSaveFieldsWidgetGroupsParams = {
  pageLayoutId: string;
};

export const useSaveFieldsWidgetGroups = ({
  pageLayoutId,
}: UseSaveFieldsWidgetGroupsParams) => {
  const fieldsWidgetGroupsDraftState = useRecoilComponentStateCallbackStateV2(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetGroupsPersistedState =
    useRecoilComponentStateCallbackStateV2(
      fieldsWidgetGroupsPersistedComponentState,
      pageLayoutId,
    );

  const [upsertFieldsWidgetMutation] = useMutation<
    UpsertFieldsWidgetResult,
    { input: UpsertFieldsWidgetInput }
  >(UPSERT_FIELDS_WIDGET);

  const { refreshAllCoreViews } = useRefreshAllCoreViews();

  const store = useStore();

  const saveFieldsWidgetGroups = useCallback(async () => {
    const allDraftGroups = store.get(fieldsWidgetGroupsDraftState);
    const allPersistedGroups = store.get(fieldsWidgetGroupsPersistedState);

    const widgetIds = new Set([
      ...Object.keys(allDraftGroups),
      ...Object.keys(allPersistedGroups),
    ]);

    for (const widgetId of widgetIds) {
      const draftGroups = allDraftGroups[widgetId] ?? [];

      await upsertFieldsWidgetMutation({
        variables: {
          input: {
            widgetId,
            groups: draftGroups.map((group) => ({
              id: group.id,
              name: group.name,
              position: group.position,
              isVisible: group.isVisible,
              fields: group.fields.flatMap((field) => {
                if (!isDefined(field.viewFieldId)) {
                  return [];
                }

                return [
                  {
                    viewFieldId: field.viewFieldId,
                    isVisible: field.isVisible,
                    position: field.position,
                  },
                ];
              }),
            })),
          },
        },
      });
    }

    store.set(fieldsWidgetGroupsPersistedState, allDraftGroups);

    await refreshAllCoreViews();

    return { status: 'successful' as const };
  }, [
    fieldsWidgetGroupsDraftState,
    fieldsWidgetGroupsPersistedState,
    upsertFieldsWidgetMutation,
    refreshAllCoreViews,
    store,
  ]);

  return { saveFieldsWidgetGroups };
};
