import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutType,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

export const getRecordTableWidgetIsUIEditable = (
  configuration: PageLayoutWidget['configuration'] | undefined,
  pageLayoutType: PageLayoutType,
): boolean => {
  if (
    !isDefined(configuration) ||
    configuration.configurationType !== WidgetConfigurationType.RECORD_TABLE
  ) {
    return false;
  }

  const defaultIsUIEditable = pageLayoutType === PageLayoutType.RECORD_PAGE;

  // 'in' narrows the configuration union: the generated types don't
  // discriminate on configurationType (it is typed as the full enum)
  return 'isUIEditable' in configuration
    ? (configuration.isUIEditable ?? defaultIsUIEditable)
    : defaultIsUIEditable;
};
