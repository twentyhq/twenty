import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { getLastGroupId } from '@/page-layout/widgets/fields/utils/getLastGroupId';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import {
  type FieldsConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

type UseGetNewFieldDefaultConfigurationParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useGetNewFieldDefaultConfiguration = ({
  pageLayoutId,
  widgetId,
}: UseGetNewFieldDefaultConfigurationParams) => {
  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetGroupsDraft = useAtomComponentStateValue(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const draftGroups = fieldsWidgetGroupsDraft[widgetId] ?? [];

  const widget = pageLayoutDraft.tabs
    .flatMap((tab) => tab.widgets)
    .find((w) => w.id === widgetId);

  const fieldsConfiguration =
    isDefined(widget?.configuration) &&
    widget.configuration.configurationType === WidgetConfigurationType.FIELDS
      ? (widget.configuration as FieldsConfiguration)
      : null;

  const lastGroupId = getLastGroupId(draftGroups);

  const persisted = fieldsConfiguration?.newFieldDefaultConfiguration;

  const newFieldDefaultConfiguration = {
    isVisible: persisted?.isVisible ?? true,
    viewFieldGroupId: persisted?.viewFieldGroupId ?? lastGroupId,
  };

  return { newFieldDefaultConfiguration, fieldsConfiguration };
};
