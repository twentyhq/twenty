import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

export const isEmptyText = (value: unknown): boolean => !isDefined(toText(value));
