import { type ConditionalDisplayEvaluationContext } from '@/conditional-display/types/ConditionalDisplayEvaluationContext';
import { evaluateConditionalDisplay } from '@/conditional-display/utils/evaluateConditionalDisplay';
import { isConditionalDisplayContextRecordFilterMatching } from '@/conditional-display/utils/isConditionalDisplayContextRecordFilterMatching';
import { isConditionalDisplayFieldRecordFilterMatching } from '@/conditional-display/utils/isConditionalDisplayFieldRecordFilterMatching';
import { isConditionalDisplaySelectedRecordPathMatching } from '@/conditional-display/utils/isConditionalDisplaySelectedRecordPathMatching';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ConditionalDisplay } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type EvaluateConditionalDisplayWithObjectMetadataParams = {
  conditionalDisplay: ConditionalDisplay | null | undefined;
  context: ConditionalDisplayEvaluationContext;
  records: Record<string, unknown>[];
  objectMetadataItem?: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

export const evaluateConditionalDisplayWithObjectMetadata = ({
  conditionalDisplay,
  context,
  records,
  objectMetadataItem,
  objectMetadataItems,
}: EvaluateConditionalDisplayWithObjectMetadataParams): boolean => {
  const hasFieldRecordFilter = (conditionalDisplay?.recordFilters ?? []).some(
    (recordFilter) => !isDefined(recordFilter.contextKey),
  );

  if (hasFieldRecordFilter && !isDefined(objectMetadataItem)) {
    return false;
  }

  return evaluateConditionalDisplay({
    conditionalDisplay,
    records,
    isRecordFilterMatching: ({ recordFilter, record }) => {
      if (!isDefined(recordFilter.contextKey)) {
        return isConditionalDisplayFieldRecordFilterMatching({
          recordFilter,
          record,
          objectMetadataItem,
          objectMetadataItems,
          currentWorkspaceMemberId: context.currentWorkspaceMemberId,
        });
      }

      if (recordFilter.contextKey === 'selectedRecords') {
        return isConditionalDisplaySelectedRecordPathMatching({
          recordFilter,
          record,
        });
      }

      return isConditionalDisplayContextRecordFilterMatching({
        recordFilter,
        context,
        objectMetadataItems,
      });
    },
  });
};
