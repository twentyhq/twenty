export type AllowanceQuotaCounter = {
  kind: 'allowance';
  key: string;
  meter: 'creditsUsedMicro';
  periodStart: Date;
  periodEnd: Date;
};
