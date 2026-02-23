import { type SUPPORTED_FILTER_OPERATORS } from 'src/engine/api/common/common-args-processors/filter-arg-processor/constants/filter-operators.constant';

export type FilterOperator = (typeof SUPPORTED_FILTER_OPERATORS)[number];
