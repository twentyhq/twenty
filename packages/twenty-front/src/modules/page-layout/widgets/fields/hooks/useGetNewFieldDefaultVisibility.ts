import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';
import {
  type FieldsConfiguration,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

type UseGetNewFieldDefaultVisibilityParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useGetNewFieldDefaultVisibility = ({
  pageLayoutId,
  widgetId,
}: UseGetNewFieldDefaultVisibilityParams) => {
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

  const newFieldDefaultVisibility =
    fieldsConfiguration?.newFieldDefaultVisibility ?? true;

  return { newFieldDefaultVisibility, fieldsConfiguration };
};
