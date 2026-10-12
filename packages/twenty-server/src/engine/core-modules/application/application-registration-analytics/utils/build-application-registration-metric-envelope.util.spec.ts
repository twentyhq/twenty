import { buildApplicationRegistrationMetricEnvelope } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-metric-envelope.util';

describe('buildApplicationRegistrationMetricEnvelope', () => {
  it('should target the applicationRegistrationMetric table with defaults filled in', () => {
    const envelope = buildApplicationRegistrationMetricEnvelope({
      applicationRegistrationId: 'registration-id',
      metric: 'install.succeeded',
      timestamp: new Date('2026-10-12T10:30:00.123Z'),
    });

    expect(envelope).toEqual({
      table: 'applicationRegistrationMetric',
      row: {
        timestamp: '2026-10-12 10:30:00.123',
        applicationRegistrationId: 'registration-id',
        universalIdentifier: '',
        version: '',
        metric: 'install.succeeded',
        dimension: '',
        context: '',
        workspaceHash: '',
        value: 1,
      },
    });
  });

  it('should keep every provided field', () => {
    const envelope = buildApplicationRegistrationMetricEnvelope({
      applicationRegistrationId: 'registration-id',
      universalIdentifier: 'universal-identifier',
      version: '1.2.3',
      metric: 'charge.credits_micro',
      dimension: 'enrich-company',
      context: 'enrich',
      workspaceHash: 'abc',
      value: 250_000,
      timestamp: new Date('2026-10-12T10:30:00.000Z'),
    });

    expect(envelope.row).toEqual({
      timestamp: '2026-10-12 10:30:00.000',
      applicationRegistrationId: 'registration-id',
      universalIdentifier: 'universal-identifier',
      version: '1.2.3',
      metric: 'charge.credits_micro',
      dimension: 'enrich-company',
      context: 'enrich',
      workspaceHash: 'abc',
      value: 250_000,
    });
  });

  it('should stamp the current time when no timestamp is given', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-02T03:04:05.006Z'));

    const envelope = buildApplicationRegistrationMetricEnvelope({
      applicationRegistrationId: 'registration-id',
      metric: 'function.execution',
    });

    expect(envelope.row.timestamp).toBe('2026-01-02 03:04:05.006');

    jest.useRealTimers();
  });
});
