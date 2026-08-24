import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

export const getRecordTableWidgetIsUIEditable = (
  configuration: PageLayoutWidget['configuration'] | undefined,
): boolean => {
  if (
    !isDefined(configuration) ||
    configuration.configurationType !== WidgetConfigurationType.RECORD_TABLE ||
    !('isUIEditable' in configuration)
  ) {
    return false;
  }

  return configuration.isUIEditable ?? false;
};
