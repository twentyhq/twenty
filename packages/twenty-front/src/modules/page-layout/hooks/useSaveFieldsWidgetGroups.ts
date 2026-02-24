import { UPSERT_FIELDS_WIDGET } from '@/page-layout/graphql/mutations/upsertFieldsWidget';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetGroupsPersistedComponentState } from '@/page-layout/states/fieldsWidgetGroupsPersistedComponentState';
import { fieldsWidgetModeDraftComponentState } from '@/page-layout/states/fieldsWidgetModeDraftComponentState';
import { fieldsWidgetModePersistedComponentState } from '@/page-layout/states/fieldsWidgetModePersistedComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { fieldsWidgetUngroupedFieldsPersistedComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsPersistedComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRefreshAllCoreViews } from '@/views/hooks/useRefreshAllCoreViews';
import { useMutation } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
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
  const fieldsWidgetGroupsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetGroupsPersistedState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsPersistedComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetUngroupedFieldsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsPersistedState =
    useRecoilComponentCallbackState(
      fieldsWidgetUngroupedFieldsPersistedComponentState,
      pageLayoutId,
    );

  const fieldsWidgetModeDraftState = useRecoilComponentCallbackState(
    fieldsWidgetModeDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetModePersistedState = useRecoilComponentCallbackState(
    fieldsWidgetModePersistedComponentState,
    pageLayoutId,
  );

  const [upsertFieldsWidgetMutation] = useMutation<
    UpsertFieldsWidgetResult,
    { input: UpsertFieldsWidgetInput }
  >(UPSERT_FIELDS_WIDGET);

  const { refreshAllCoreViews } = useRefreshAllCoreViews();

  const saveFieldsWidgetGroups = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const allDraftGroups = snapshot
          .getLoadable(fieldsWidgetGroupsDraftState)
          .getValue();
        const allPersistedGroups = snapshot
          .getLoadable(fieldsWidgetGroupsPersistedState)
          .getValue();
        const allUngroupedFieldsDraft = snapshot
          .getLoadable(fieldsWidgetUngroupedFieldsDraftState)
          .getValue();
        const allModes = snapshot
          .getLoadable(fieldsWidgetModeDraftState)
          .getValue();

        const widgetIds = new Set([
          ...Object.keys(allDraftGroups),
          ...Object.keys(allPersistedGroups),
          ...Object.keys(allUngroupedFieldsDraft),
        ]);

        for (const widgetId of widgetIds) {
          const mode = allModes[widgetId] ?? 'ungrouped';

          if (mode === 'grouped') {
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
          } else {
            const ungroupedFields = allUngroupedFieldsDraft[widgetId] ?? [];

            await upsertFieldsWidgetMutation({
              variables: {
                input: {
                  widgetId,
                  fields: ungroupedFields.flatMap((field) => {
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
                },
              },
            });
          }
        }

        set(fieldsWidgetGroupsPersistedState, allDraftGroups);
        set(fieldsWidgetUngroupedFieldsPersistedState, allUngroupedFieldsDraft);
        set(fieldsWidgetModePersistedState, allModes);

        await refreshAllCoreViews();

        return { status: 'successful' as const };
      },
    [
      fieldsWidgetGroupsDraftState,
      fieldsWidgetGroupsPersistedState,
      fieldsWidgetUngroupedFieldsDraftState,
      fieldsWidgetUngroupedFieldsPersistedState,
      fieldsWidgetModeDraftState,
      fieldsWidgetModePersistedState,
      upsertFieldsWidgetMutation,
      refreshAllCoreViews,
    ],
  );

  return { saveFieldsWidgetGroups };
};
