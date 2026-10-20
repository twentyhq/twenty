import { removeUndefinedFields } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const isEchoOfPastStepFilterSetting = <TValue>({
  pastStepFilterSettings,
  incomingStepFilterSetting,
}: {
  pastStepFilterSettings: Array<TValue | Partial<TValue>>;
  incomingStepFilterSetting: TValue;
}) => {
  const normalizedIncomingStepFilterSetting = removeUndefinedFields(
    incomingStepFilterSetting,
  );

  return pastStepFilterSettings.some((pastStepFilterSetting) =>
    isDeeplyEqual(pastStepFilterSetting, normalizedIncomingStepFilterSetting),
  );
};
