import { type ViewFilter } from '@/views/types/ViewFilter';
import { jsonRelationFilterValueSchema } from 'twenty-shared/utils';

// Record page relation tables anchor their rows to the page's record with this filter, which users cannot pick themselves
export const isCurrentRecordViewFilter = ({
  value,
}: Pick<ViewFilter, 'value'>) =>
  jsonRelationFilterValueSchema.safeParse(value).data
    ?.isCurrentRecordSelected === true;
