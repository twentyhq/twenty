/* @license Enterprise */

import { type UsageBreakdownItemDTO } from 'src/engine/core-modules/usage/dtos/usage-breakdown-item.dto';
import { type UsageBreakdownItem } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

export const fromUsageBreakdownItemToUsageBreakdownItemDTO = ({
  key,
  label,
  creditsUsed,
  userCreditsUsed,
  workspaceCreditsUsed,
}: UsageBreakdownItem): UsageBreakdownItemDTO => ({
  key,
  label,
  creditsUsed: toDisplayCredits(creditsUsed),
  userCreditsUsed: toDisplayCredits(userCreditsUsed),
  workspaceCreditsUsed: toDisplayCredits(workspaceCreditsUsed),
});
