import {
  type ShahryarReportApiNotificationKind,
  type ShahryarReportApiNotificationSeverity,
} from '@/shahryar/types/shahryarReportApi';

export type ShahryarNotificationDeliveryStatus = 'pending' | 'sent' | 'failed';

export type ShahryarNotificationDelivery = {
  id: string;
  notificationId: string;
  kind: ShahryarReportApiNotificationKind;
  severity: ShahryarReportApiNotificationSeverity;
  supervisorId: string;
  supervisorName: string;
  marketId?: string;
  marketName?: string;
  deviceId: string;
  expoPushToken: string;
  title: string;
  body: string;
  status: ShahryarNotificationDeliveryStatus;
  attemptCount: number;
  lastAttemptAt?: string;
  failureReason?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ShahryarNotificationDispatchResult = {
  attemptedCount: number;
  sentCount: number;
  failedCount: number;
  failedDeliveryIds: string[];
};
