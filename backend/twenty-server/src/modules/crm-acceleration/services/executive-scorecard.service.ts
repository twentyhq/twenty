import { Injectable } from '@nestjs/common';

interface ScorecardMetricInput {
  key: string;
  label: string;
  value: number;
  target?: number;
  warningThreshold?: number;
}

type ScoreStatus = 'on-track' | 'at-risk' | 'off-track';

interface ScorecardRequestInput {
  metrics: ScorecardMetricInput[];
}

@Injectable()
export class ExecutiveScorecardService {
  private resolveStatus(metric: ScorecardMetricInput): ScoreStatus {
    if (metric.target === undefined) {
      const warningThreshold = metric.warningThreshold ?? 0;

      if (metric.value < warningThreshold) {
        return 'off-track';
      }

      return 'on-track';
    }

    const progress = metric.target === 0 ? 0 : metric.value / metric.target;

    if (progress >= 1) {
      return 'on-track';
    }

    if (progress >= 0.8) {
      return 'at-risk';
    }

    return 'off-track';
  }

  buildScorecard(input: ScorecardRequestInput) {
    const widgets = input.metrics.map((metric) => {
      const status = this.resolveStatus(metric);
      const progress =
        metric.target === undefined || metric.target === 0
          ? null
          : Math.round((metric.value / metric.target) * 100);

      return {
        ...metric,
        status,
        progress,
      };
    });

    const statusTotals = widgets.reduce(
      (accumulator, widget) => {
        accumulator[widget.status] += 1;
        return accumulator;
      },
      { 'on-track': 0, 'at-risk': 0, 'off-track': 0 } as Record<ScoreStatus, number>,
    );

    return {
      generatedAt: new Date().toISOString(),
      totalWidgets: widgets.length,
      statusTotals,
      widgets,
    };
  }
}
