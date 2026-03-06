import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
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

  const widget = pageLayoutDraft.tabs
    .flatMap((tab) => tab.widgets)
    .find((w) => w.id === widgetId);

  const fieldsConfiguration =
    isDefined(widget?.configuration) &&
    widget.configuration.configurationType === WidgetConfigurationType.FIELDS
      ? (widget.configuration as FieldsConfiguration)
      : null;

  const persisted = fieldsConfiguration?.newFieldDefaultConfiguration;

  const newFieldDefaultConfiguration = {
    isVisible: persisted?.isVisible ?? true,
    viewFieldGroupId: persisted?.viewFieldGroupId ?? null,
  };

  return { newFieldDefaultConfiguration, fieldsConfiguration };
};
