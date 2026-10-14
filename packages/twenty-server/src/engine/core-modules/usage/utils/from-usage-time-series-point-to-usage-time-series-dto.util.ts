/* @license Enterprise */

import { type UsageTimeSeriesDTO } from 'src/engine/core-modules/usage/dtos/usage-time-series.dto';
import { type UsageTimeSeriesPoint } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

export const fromUsageTimeSeriesPointToUsageTimeSeriesDTO = ({
  date,
  workspaceCreditsUsed,
  userCreditsUsed,
}: UsageTimeSeriesPoint): UsageTimeSeriesDTO => ({
  date,
  creditsUsed: toDisplayCredits(workspaceCreditsUsed + userCreditsUsed),
});
