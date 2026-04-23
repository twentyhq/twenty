import { registerEnumType } from '@nestjs/graphql';

export enum QueueMetricsTimeRange {
  SevenDays = '7D',
  OneDay = '1D',
  TwelveHours = '12H',
  FourHours = '4H',
  OneHour = '1H',
}

registerEnumType(QueueMetricsTimeRange, {
  name: 'QueueMetricsTimeRange',
});
