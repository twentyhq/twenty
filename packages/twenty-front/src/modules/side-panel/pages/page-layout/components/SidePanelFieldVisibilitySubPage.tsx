import { ConditionalDisplaySettings } from '@/conditional-display/components/ConditionalDisplaySettings';
import { fieldsWidgetEditingFieldMetadataIdComponentState } from '@/page-layout/states/fieldsWidgetEditingFieldMetadataIdComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useUpdateFieldConditionalDisplayInDraft } from '@/page-layout/widgets/fields/hooks/useUpdateFieldConditionalDisplayInDraft';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelFieldVisibilitySubPage = () => {
  const { pageLayoutId } = usePageLayoutSidePanelTarget();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const widgetId = widgetInEditMode?.id ?? '';

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetEditingFieldMetadataId = useAtomComponentStateValue(
    fieldsWidgetEditingFieldMetadataIdComponentState,
    pageLayoutId,
  );

  const fieldsWidgetGroupsDraft = useAtomComponentStateValue(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsDraft = useAtomComponentStateValue(
    fieldsWidgetUngroupedFieldsDraftComponentState,
    pageLayoutId,
  );

  const { updateFieldConditionalDisplay } =
    useUpdateFieldConditionalDisplayInDraft({ pageLayoutId, widgetId });

  const field = [
    ...(fieldsWidgetGroupsDraft[widgetId] ?? []).flatMap(
      (group) => group.fields,
    ),
    ...(fieldsWidgetUngroupedFieldsDraft[widgetId] ?? []),
  ].find(
    (draftField) =>
      draftField.fieldMetadataItem.id === fieldsWidgetEditingFieldMetadataId,
  );

  if (!isDefined(widgetInEditMode) || !isDefined(field)) {
    return null;
  }

  return (
    <ConditionalDisplaySettings
      surface="viewField"
      surfaceId={`${widgetInEditMode.id}-${field.fieldMetadataItem.id}`}
      conditionalDisplay={field.conditionalDisplay}
      objectMetadataId={pageLayoutDraft.objectMetadataId}
      onConditionalDisplayChange={(conditionalDisplay) =>
        updateFieldConditionalDisplay(
          field.fieldMetadataItem.id,
          conditionalDisplay,
        )
      }
    />
  );
};
