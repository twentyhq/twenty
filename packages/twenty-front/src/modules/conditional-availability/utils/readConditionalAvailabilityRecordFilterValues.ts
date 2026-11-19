import { CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE } from '@/conditional-availability/constants/ConditionalAvailabilityCurrentWorkspaceMemberOptionValue';
import { CONDITIONAL_AVAILABILITY_DATE_TIME_DAY_START_SUFFIX } from '@/conditional-availability/constants/ConditionalAvailabilityDateTimeDayStartSuffix';
import { type ConditionalAvailabilityRecordFieldKind } from '@/conditional-availability/types/ConditionalAvailabilityRecordFieldKind';
import { parseJson } from 'twenty-shared/utils';
import { z } from 'zod';

const textListSchema = z.array(z.string());

const relationValueSchema = z.object({
  isCurrentWorkspaceMemberSelected: z.boolean(),
  selectedRecordIds: z.array(z.string()),
});

export const readConditionalAvailabilityRecordFilterValues = ({
  fieldKind,
  value,
}: {
  fieldKind: ConditionalAvailabilityRecordFieldKind;
  value: string;
}): string[] | null => {
  if (value === '') {
    return [];
  }

  switch (fieldKind) {
    case 'select':
    case 'multiSelect':
    case 'identifier': {
      const result = textListSchema.safeParse(parseJson<unknown>(value));

      return result.success ? result.data : null;
    }
    case 'workspaceMemberRelation':
    case 'recordRelation': {
      const result = relationValueSchema.safeParse(parseJson<unknown>(value));

      if (!result.success) {
        return null;
      }

      return result.data.isCurrentWorkspaceMemberSelected
        ? [
            CONDITIONAL_AVAILABILITY_CURRENT_WORKSPACE_MEMBER_OPTION_VALUE,
            ...result.data.selectedRecordIds,
          ]
        : result.data.selectedRecordIds;
    }
    case 'dateTime':
      if (
        !value.endsWith(CONDITIONAL_AVAILABILITY_DATE_TIME_DAY_START_SUFFIX)
      ) {
        return [value];
      }

      return [
        value.slice(
          0,
          -CONDITIONAL_AVAILABILITY_DATE_TIME_DAY_START_SUFFIX.length,
        ),
      ];
    default:
      return [value];
  }
};
