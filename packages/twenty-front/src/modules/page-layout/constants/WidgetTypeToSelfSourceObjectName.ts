import { CoreObjectNameSingular } from 'twenty-shared/types';
import { WidgetType } from '~/generated-metadata/graphql';

// These widgets normally reach their records through a relation, but the
// relation is unnecessary when the target record already is that record.
export const WIDGET_TYPE_TO_SELF_SOURCE_OBJECT_NAME: Partial<
  Record<WidgetType, string>
> = {
  [WidgetType.CALL_RECORDING_SUMMARY]: CoreObjectNameSingular.CallRecording,
  [WidgetType.CALL_RECORDING_TRANSCRIPT]: CoreObjectNameSingular.CallRecording,
};
