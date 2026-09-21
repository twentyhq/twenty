import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { type FieldWidgetJunctionConfig } from '@/page-layout/widgets/field/utils/resolveFieldWidgetJunctionConfig';
import { isDefined } from 'twenty-shared/utils';

export const canSeeAllForJunctionConfig = (
  junctionConfig: FieldWidgetJunctionConfig | null,
): boolean => {
  return (
    !isDefined(junctionConfig) ||
    (isUsableJunctionConfig(junctionConfig) && !junctionConfig.isMorphRelation)
  );
};
