/* @license Enterprise */

import { type UsageBreakdownItemDTO } from 'src/engine/core-modules/usage/dtos/usage-breakdown-item.dto';
import { type UsageBreakdownItem } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

export const fromUsageBreakdownItemToUsageBreakdownItemDTO = ({
  key,
  label,
  workspaceCreditsUsed,
  userCreditsUsed,
}: UsageBreakdownItem): UsageBreakdownItemDTO => ({
  key,
  label,
  creditsUsed: toDisplayCredits(workspaceCreditsUsed + userCreditsUsed),
  userCreditsUsed: toDisplayCredits(userCreditsUsed),
});
