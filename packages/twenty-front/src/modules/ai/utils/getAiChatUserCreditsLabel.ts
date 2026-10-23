import { plural, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getAiChatUserCreditsLabel = ({
  formattedRemainingCredits,
  daysUntilReset,
}: {
  formattedRemainingCredits: string | null;
  daysUntilReset: number;
}): string =>
  isDefined(formattedRemainingCredits)
    ? t`${formattedRemainingCredits} left, reset in ${plural(daysUntilReset, { one: '# day', other: '# days' })}`
    : t`Reset in ${plural(daysUntilReset, { one: '# day', other: '# days' })}`;
