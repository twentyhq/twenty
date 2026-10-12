import { sortApplicationRegistrationsForAdmin } from 'src/engine/core-modules/application/application-registration/utils/sort-application-registrations-for-admin.util';

const buildRegistration = ({
  id,
  isVetted = false,
  isListed = false,
  createdAt = '2026-01-01T00:00:00.000Z',
}: {
  id: string;
  isVetted?: boolean;
  isListed?: boolean;
  createdAt?: string;
}) => ({ id, isVetted, isListed, createdAt: new Date(createdAt) });

const sortedIds = (
  registrations: ReturnType<typeof buildRegistration>[],
  configuredIds: string[] = [],
) =>
  sortApplicationRegistrationsForAdmin({
    registrations,
    isConfiguredByRegistrationId: new Map(
      registrations.map((registration) => [
        registration.id,
        configuredIds.includes(registration.id),
      ]),
    ),
  }).map((registration) => registration.id);

describe('sortApplicationRegistrationsForAdmin', () => {
  it('puts vetted registrations first', () => {
    const registrations = [
      buildRegistration({ id: 'community' }),
      buildRegistration({ id: 'vetted', isVetted: true }),
    ];

    expect(sortedIds(registrations, ['community', 'vetted'])).toEqual([
      'vetted',
      'community',
    ]);
  });

  it('puts registrations missing configuration before configured ones', () => {
    const registrations = [
      buildRegistration({ id: 'configured' }),
      buildRegistration({ id: 'not-configured' }),
    ];

    expect(sortedIds(registrations, ['configured'])).toEqual([
      'not-configured',
      'configured',
    ]);
  });

  it('puts listed registrations last', () => {
    const registrations = [
      buildRegistration({ id: 'listed', isListed: true }),
      buildRegistration({ id: 'not-listed' }),
    ];

    expect(sortedIds(registrations, ['listed', 'not-listed'])).toEqual([
      'not-listed',
      'listed',
    ]);
  });

  it('orders newest first within a group and breaks ties by id', () => {
    const registrations = [
      buildRegistration({ id: 'b-old', createdAt: '2026-01-01T00:00:00.000Z' }),
      buildRegistration({ id: 'a-old', createdAt: '2026-01-01T00:00:00.000Z' }),
      buildRegistration({ id: 'new', createdAt: '2026-02-01T00:00:00.000Z' }),
    ];

    expect(sortedIds(registrations)).toEqual(['new', 'a-old', 'b-old']);
  });

  it('applies vetted, then configuration, then listed, then creation date', () => {
    const registrations = [
      buildRegistration({
        id: 'community-configured-listed',
        isListed: true,
        createdAt: '2026-03-01T00:00:00.000Z',
      }),
      buildRegistration({
        id: 'community-configured-unlisted',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      buildRegistration({
        id: 'community-not-configured',
        isListed: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      buildRegistration({
        id: 'vetted-configured-listed',
        isVetted: true,
        isListed: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      buildRegistration({
        id: 'vetted-configured-unlisted',
        isVetted: true,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
      buildRegistration({
        id: 'vetted-not-configured',
        isVetted: true,
        createdAt: '2025-01-01T00:00:00.000Z',
      }),
    ];

    expect(
      sortedIds(registrations, [
        'community-configured-listed',
        'community-configured-unlisted',
        'vetted-configured-listed',
        'vetted-configured-unlisted',
      ]),
    ).toEqual([
      'vetted-not-configured',
      'vetted-configured-unlisted',
      'vetted-configured-listed',
      'community-not-configured',
      'community-configured-unlisted',
      'community-configured-listed',
    ]);
  });

  it('does not mutate the input array', () => {
    const registrations = [
      buildRegistration({ id: 'community' }),
      buildRegistration({ id: 'vetted', isVetted: true }),
    ];

    sortApplicationRegistrationsForAdmin({
      registrations,
      isConfiguredByRegistrationId: new Map(),
    });

    expect(registrations.map((registration) => registration.id)).toEqual([
      'community',
      'vetted',
    ]);
  });
});
